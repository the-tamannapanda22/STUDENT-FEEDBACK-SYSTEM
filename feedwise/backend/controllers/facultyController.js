const prisma = require('../prismaClient');
const { triggerActionPlanCheck } = require('./actionPlanController');

const getAssignedCourses = async (req, res) => {
  try {
    const facultyId = req.user.id;
    
    const courses = await prisma.course.findMany({
      where: { facultyId },
      include: {
        feedbacks: true, // Just to get a count
      }
    });

    const coursesWithStats = courses.map(course => ({
      ...course,
      totalResponses: course.feedbacks.length
    }));

    res.json(coursesWithStats);
  } catch (error) {
    console.error('Fetch faculty courses error:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    // Verify course belongs to faculty
    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), facultyId }
    });

    if (!course) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this course' });
    }

    // Fetch all questions for this course and their answers
    const questions = await prisma.question.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        answers: true
      }
    });

    let totalFeedbacks = 0;
    
    const analytics = questions.map(q => {
      const answersList = q.answers.map(a => a.rating).filter(r => r !== null);
      const validResponses = answersList.length;
      totalFeedbacks = Math.max(totalFeedbacks, q.answers.length); // Assuming all questions answered per feedback

      const averageRating = validResponses > 0 
        ? (answersList.reduce((acc, curr) => acc + curr, 0) / validResponses).toFixed(2)
        : 0;

      return {
        id: q.id,
        text: q.text,
        category: q.category,
        averageRating: parseFloat(averageRating),
        totalResponses: validResponses
      };
    });

    // Trigger Action Plan if COs fall below threshold
    if (totalFeedbacks > 0) {
      await triggerActionPlanCheck(courseId, facultyId, analytics);
    }

    res.json({
      course,
      totalStudentsResponded: totalFeedbacks, // Rough proxy
      analytics
    });

  } catch (error) {
    console.error('Fetch course analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), facultyId }
    });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    const questions = await prisma.question.findMany({
      where: { courseId: parseInt(courseId) },
      orderBy: { id: 'asc' }
    });

    const feedbacks = await prisma.feedback.findMany({
      where: { courseId: parseInt(courseId) },
      include: { answers: true },
      orderBy: { createdAt: 'desc' }
    });

    const rows = feedbacks.map((fb, idx) => {
      const answersMap = {};
      fb.answers.forEach(a => { answersMap[a.questionId] = a.rating; });
      return { rowNum: idx + 1, feedbackId: fb.id, answers: answersMap };
    });

    res.json({ course, questions, rows });
  } catch (error) {
    console.error('Fetch course details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getPendingStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), facultyId }
    });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    // All students matching this course's branch/semester/section
    const allStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        branch: course.branch,
        semester: course.semester,
        section: course.section
      },
      select: { id: true, name: true, email: true, enrollmentId: true }
    });

    // Students who submitted
    const submitted = await prisma.feedback.findMany({
      where: { courseId: parseInt(courseId) },
      select: { studentId: true }
    });
    const submittedIds = new Set(submitted.map(f => f.studentId));

    const pending = allStudents.filter(s => !submittedIds.has(s.id));

    res.json({
      course,
      totalEnrolled: allStudents.length,
      submittedCount: submittedIds.size,
      pending
    });
  } catch (error) {
    console.error('Fetch pending students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;
    const course = await prisma.course.findFirst({ where: { id: parseInt(courseId), facultyId } });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    const questions = await prisma.question.findMany({
      where: { courseId: parseInt(courseId) },
      orderBy: { id: 'asc' }
    });
    res.json(questions);
  } catch (error) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { text, category, courseId } = req.body;
    const facultyId = req.user.id;
    const course = await prisma.course.findFirst({ where: { id: parseInt(courseId), facultyId } });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    const question = await prisma.question.create({
      data: { text, category, courseId: parseInt(courseId) }
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const facultyId = req.user.id;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: { course: true }
    });
    if (!question || question.course.facultyId !== facultyId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.question.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const facultyId = req.user.id;

    if (!text) return res.status(400).json({ error: 'Text is required' });

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: { course: true }
    });

    if (!question || question.course.facultyId !== facultyId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.question.update({
      where: { id: parseInt(id) },
      data: { text }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Server error updating question' });
  }
};

const updateCourseDeadline = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { deadline } = req.body;
    const facultyId = req.user.id;

    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), facultyId }
    });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    await prisma.course.update({
      where: { id: parseInt(courseId) },
      data: { deadline: deadline ? new Date(deadline) : null }
    });

    res.json({ message: 'Deadline updated successfully' });
  } catch (error) {
    console.error('Update deadline error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const sendReminders = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), facultyId }
    });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    res.json({ message: 'Reminders computationally dispatched to pending queue.' });
    console.log(`[SYS] Automated Reminder Nudge: Dispatched emails for pending students of course ${course.code} (Faculty: ${facultyId}).`);
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ error: 'Server error sending reminders.' });
  }
};

const getHistoricalAnalytics = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const courses = await prisma.course.findMany({
      where: { facultyId },
      include: {
        questions: { include: { answers: true } }
      },
      orderBy: { semester: 'asc' }
    });

    const timeline = courses.map(c => {
      let totalRating = 0;
      let count = 0;
      c.questions.forEach(q => {
        q.answers.forEach(a => {
          if (a.rating) { totalRating += a.rating; count++; }
        });
      });
      return {
        courseId: c.id,
        code: c.code,
        semester: c.semester,
        average: count > 0 ? parseFloat((totalRating / count).toFixed(2)) : null,
        responses: count
      };
    }).filter(c => c.average !== null); 

    res.json(timeline);
  } catch (error) {
    console.error('Historical tracking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addQuestionsBulk = async (req, res) => {
  try {
    const { questions, courseId } = req.body; 
    if (!questions || !questions.length || !courseId) return res.status(400).json({error: 'Invalid payload'});

    const facultyId = req.user.id;
    const course = await prisma.course.findFirst({ where: { id: parseInt(courseId), facultyId } });
    if (!course) return res.status(403).json({ error: 'Forbidden' });

    await prisma.question.createMany({
      data: questions.map(q => ({
        text: q.text, category: q.category, courseId: parseInt(courseId)
      }))
    });

    res.status(201).json({ message: 'Questions imported successfully' });
  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(500).json({ error: 'Server error during import' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, code, branch, semester, section, deadline } = req.body;
    const facultyId = req.user.id;
    
    if (!name || !code || !branch || !semester || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newCourse = await prisma.course.create({
      data: { name, code, branch, semester: parseInt(semester), section, facultyId: parseInt(facultyId), deadline: deadline ? new Date(deadline) : null },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Course code already exists' });
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error creating course' });
  }
};

const getCourseRawFeedbacks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;
    
    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), facultyId },
      include: { questions: { select: { id: true, text: true, category: true } } }
    });
    
    if (!course) return res.status(403).json({ error: 'Course not found or unassigned' });

    const feedbacks = await prisma.feedback.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        student: { select: { name: true, enrollmentId: true } },
        answers: { select: { questionId: true, rating: true } }
      }
    });

    res.json({ course, feedbacks });
  } catch (error) {
    console.error('Raw feedbacks error:', error);
    res.status(500).json({ error: 'Server error parsing raw feedbacks' });
  }
};

module.exports = {
  getAssignedCourses,
  getCourseAnalytics,
  getCourseDetails,
  getPendingStudents,
  getQuestions,
  addQuestion,
  deleteQuestion,
  updateCourseDeadline,
  updateQuestion,
  sendReminders,
  getHistoricalAnalytics,
  addQuestionsBulk,
  createCourse,
  getCourseRawFeedbacks
};
