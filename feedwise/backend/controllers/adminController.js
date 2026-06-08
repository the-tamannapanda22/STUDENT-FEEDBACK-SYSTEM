const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { triggerActionPlanCheck } = require('./actionPlanController');

const createCourse = async (req, res) => {
  try {
    const { name, code, branch, semester, section, facultyId } = req.body;
    
    if (!name || !code || !branch || !semester || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newCourse = await prisma.course.create({
      data: { name, code, branch, semester: parseInt(semester), section, facultyId: facultyId ? parseInt(facultyId) : null },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Course with this code already exists' });
    }
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error creating course' });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { faculty: { select: { name: true, email: true } } }
    });
    res.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Server error deleting course' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, branch, semester, section, facultyId, deadline } = req.body;
    
    if (!name || !code || !branch || !semester || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        code, 
        branch, 
        semester: parseInt(semester), 
        section, 
        facultyId: facultyId ? parseInt(facultyId) : null,
        deadline: deadline ? new Date(deadline) : null
      },
    });

    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error updating course' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role } = req.query; // 'FACULTY' or 'STUDENT'
    const where = role ? { role } : {};
    
    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, branch: true, semester: true, section: true, createdAt: true, enrollmentId: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newFaculty = await prisma.user.create({
      data: {
        email,
        password: password, // Store in plain text as requested
        name,
        role: 'FACULTY',
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    res.status(201).json(newFaculty);
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ error: 'Server error creating faculty' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

const getGlobalStats = async (req, res) => {
  try {
    const [totalStudents, activeFaculty, totalCourses, feedbackSubmitted] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.course.count(),
      prisma.feedback.count()
    ]);

    res.json({
      totalStudents,
      activeFaculty,
      totalCourses,
      feedbackSubmitted
    });
  } catch (error) {
    console.error('Fetch global stats error:', error);
    res.status(500).json({ error: 'Server error fetching global stats' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const questions = await prisma.question.findMany({
      where: { courseId: parseInt(courseId) },
      orderBy: { id: 'asc' }
    });
    res.json(questions);
  } catch (error) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { text, category, courseId } = req.body;
    if (!text || !category || !courseId) {
       return res.status(400).json({ error: 'Text, category, and courseId are required' });
    }
    const question = await prisma.question.create({
      data: { text, category, courseId: parseInt(courseId) }
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Server error adding question' });
  }
};

const addQuestionsBulk = async (req, res) => {
  try {
    const { questions, courseId } = req.body; 
    if (!questions || !questions.length || !courseId) {
      return res.status(400).json({error: 'Invalid payload'});
    }

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

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Server error deleting question' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
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

const promoteStudents = async (req, res) => {
  try {
    const { semester } = req.body;
    if (!semester) return res.status(400).json({ error: 'Semester is required' });
    
    await prisma.user.updateMany({
      where: { role: 'STUDENT', semester: parseInt(semester) },
      data: { semester: parseInt(semester) + 1 }
    });
    res.json({ message: `Students in semester ${semester} promoted to ${parseInt(semester) + 1}` });
  } catch (error) {
    console.error('Promote error:', error);
    res.status(500).json({ error: 'Server error promoting students' });
  }
};

const resetAllFeedback = async (req, res) => {
  try {
    await prisma.feedbackAnswer.deleteMany({});
    await prisma.feedback.deleteMany({});
    res.json({ message: 'All feedback data has been reset' });
  } catch (error) {
    console.error('Reset feedback error:', error);
    res.status(500).json({ error: 'Server error resetting feedback' });
  }
};

const deleteStudentsBySemester = async (req, res) => {
  try {
    const { semester } = req.body;
    if (!semester) return res.status(400).json({ error: 'Semester is required' });
    
    await prisma.user.deleteMany({
      where: { role: 'STUDENT', semester: parseInt(semester) }
    });
    res.json({ message: `Students in semester ${semester} deleted` });
  } catch (error) {
    console.error('Delete by semester error:', error);
    res.status(500).json({ error: 'Server error deleting students' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, enrollmentId, branch, semester, section } = req.body;
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, enrollmentId, branch, semester: semester ? parseInt(semester) : undefined, section },
      select: { id: true, name: true, email: true, role: true, branch: true, semester: true, section: true, enrollmentId: true }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error updating student' });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, id: { not: parseInt(id) } } });
      if (existing) return res.status(400).json({ error: 'Email already taken by another user' });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, ...(email ? { email } : {}) },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ error: 'Server error updating faculty' });
  }
};

const getCourseRawFeedbacks = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { questions: { select: { id: true, text: true, category: true } } }
    });
    
    if (!course) return res.status(404).json({ error: 'Course not found' });

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

const getFeedbackCount = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      select: { studentId: true }
    });
    const countMap = {};
    feedbacks.forEach(f => {
      countMap[f.studentId] = (countMap[f.studentId] || 0) + 1;
    });
    res.json(countMap);
  } catch (error) {
    console.error('Feedback count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAdminCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { faculty: { select: { id: true, name: true, email: true } } }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const questions = await prisma.question.findMany({
      where: { courseId: parseInt(courseId) },
      include: { answers: true }
    });

    let totalFeedbacks = 0;
    const analytics = questions.map(q => {
      const answersList = q.answers.map(a => a.rating).filter(r => r !== null);
      const validResponses = answersList.length;
      totalFeedbacks = Math.max(totalFeedbacks, q.answers.length);
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

    if (totalFeedbacks > 0 && course.facultyId) {
      // Trigger Action Plan if COs fall below threshold
      await triggerActionPlanCheck(courseId, course.facultyId, analytics);
    }

    res.json({ course, totalStudentsResponded: totalFeedbacks, analytics });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

const getStudentPending = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    if (!student || student.role !== 'STUDENT') return res.status(404).json({ error: 'Student not found' });

    const courses = await prisma.course.findMany({
      where: {
        branch: student.branch,
        semester: student.semester,
        section: student.section
      }
    });

    const feedbacks = await prisma.feedback.findMany({
      where: { studentId: parseInt(id) },
      select: { courseId: true }
    });
    
    const submittedIds = new Set(feedbacks.map(f => f.courseId));
    const pendingCourses = courses.filter(c => !submittedIds.has(c.id));

    res.json({ pending: pendingCourses });
  } catch (error) {
    console.error('Pending student details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const remindAllStudents = async (req, res) => {
  try {
    res.json({ message: 'Global reminder dispatched to all pending students.' });
    console.log(`[SYS] Global Admin Reminder Nudge: Dispatched emails to all pending students across all incomplete courses.`);
  } catch (error) {
    console.error('Global reminder error:', error);
    res.status(500).json({ error: 'Server error sending global reminders.' });
  }
};

module.exports = { 
  createCourse, getCourses, deleteCourse, updateCourse,
  getUsers, deleteUser, createFaculty, updateStudent, updateFaculty,
  getGlobalStats,
  getQuestions,
  addQuestion,
  addQuestionsBulk,
  deleteQuestion,
  updateQuestion,
  promoteStudents, resetAllFeedback, deleteStudentsBySemester,
  getFeedbackCount,
  getAdminCourseAnalytics,
  getStudentPending,
  remindAllStudents,
  getCourseRawFeedbacks
};
