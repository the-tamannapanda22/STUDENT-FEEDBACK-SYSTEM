const express = require('express');
const { getStudentCourses, getCourseQuestions, submitFeedback } = require('../controllers/studentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['STUDENT']));

router.get('/courses', getStudentCourses);
router.get('/courses/:courseId/questions', getCourseQuestions);
router.post('/courses/:courseId/feedback', submitFeedback);

module.exports = router;
