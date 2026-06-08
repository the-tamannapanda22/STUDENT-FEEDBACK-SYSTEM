const prisma = require('../prismaClient');

const getFacultyActionPlans = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const plans = await prisma.actionPlan.findMany({
      where: { facultyId },
      include: {
        course: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    console.error('Fetch faculty action plans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateActionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planText } = req.body;
    const facultyId = req.user.id;

    const plan = await prisma.actionPlan.findUnique({ where: { id: parseInt(id) } });
    if (!plan || plan.facultyId !== facultyId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedPlan = await prisma.actionPlan.update({
      where: { id: parseInt(id) },
      data: {
        planText,
        status: planText && planText.trim() ? 'SUBMITTED' : 'PENDING'
      }
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Update action plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAdminActionPlans = async (req, res) => {
  try {
    const plans = await prisma.actionPlan.findMany({
      include: {
        course: true,
        faculty: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    console.error('Fetch admin action plans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const triggerActionPlanCheck = async (courseId, facultyId, analytics) => {
  try {
    // Only care about COURSE_OUTCOMES category
    const coQuestions = analytics.filter(q => q.category === 'COURSE_OUTCOMES');
    if (coQuestions.length === 0) return;

    let totalRating = 0;
    let answeredQuestions = 0;

    coQuestions.forEach(q => {
      if (q.totalResponses > 0 && typeof q.averageRating === 'number') {
        totalRating += q.averageRating;
        answeredQuestions++;
      }
    });

    if (answeredQuestions === 0) return;

    const avgCOAttainment = totalRating / answeredQuestions;
    // Assume max CO rating is 3. 60% of 3 is 1.8.
    const threshold = 1.8;

    if (avgCOAttainment < threshold) {
      // Check if plan exists
      const existing = await prisma.actionPlan.findUnique({ where: { courseId: parseInt(courseId) } });
      if (!existing) {
        await prisma.actionPlan.create({
          data: {
            courseId: parseInt(courseId),
            facultyId: parseInt(facultyId),
            status: 'PENDING'
          }
        });
        console.log(`Action Plan triggered for course ${courseId}`);
      }
    }
  } catch (error) {
    console.error('Trigger Action Plan Error:', error);
  }
};

module.exports = {
  getFacultyActionPlans,
  updateActionPlan,
  getAdminActionPlans,
  triggerActionPlanCheck
};
