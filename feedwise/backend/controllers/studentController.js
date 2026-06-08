const prisma = require('../prismaClient');

const getStudentCourses = async (req, res) => {
  try {
    const student = req.user;
    
    // Automatic course assignment based on branch, semester, section
    const dbStudent = await prisma.user.findUnique({ where: { id: student.id } });
    
    if (!dbStudent) return res.status(404).json({ error: 'Student not found' });
    
    const courses = await prisma.course.findMany({
      where: {
        branch: dbStudent.branch,
        semester: dbStudent.semester,
        section: dbStudent.section,
      },
      include: {
        faculty: { select: { name: true } },
        feedbacks: {
          where: { studentId: dbStudent.id }
        }
      }
    });

    const enrichedCourses = courses.map(course => ({
      ...course,
      hasSubmittedFeedback: course.feedbacks.length > 0
    }));

    res.json(enrichedCourses);
  } catch (error) {
    console.error('Fetch student courses error:', error);
    res.status(500).json({ error: 'Server error fetching student courses' });
  }
};

const getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const questions = await prisma.question.findMany({
      where: { courseId: parseInt(courseId) },
    });
    res.json(questions);
  } catch (error) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // Array of { questionId, rating }
    const studentId = req.user.id;

    // Check if already submitted
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (course.deadline && new Date() > new Date(course.deadline)) {
      return res.status(403).json({ error: 'Feedback submission deadline has expired' });
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        studentId_courseId: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
        }
      }
    });

    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this course' });
    }

    // Create feedback and answers in a transaction
    await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
        }
      });

      const formattedAnswers = answers.map(ans => ({
        feedbackId: feedback.id,
        questionId: ans.questionId,
        rating: ans.rating,
      }));

      await tx.feedbackAnswer.createMany({
        data: formattedAnswers
      });
    });

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
};

module.exports = { getStudentCourses, getCourseQuestions, submitFeedback };
