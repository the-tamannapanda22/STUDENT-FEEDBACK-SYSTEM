const express = require('express');
const { getAssignedCourses, getCourseAnalytics, getCourseDetails, getPendingStudents, getQuestions, addQuestion, deleteQuestion, updateCourseDeadline, updateQuestion, sendReminders, getHistoricalAnalytics, addQuestionsBulk, createCourse, getCourseRawFeedbacks } = require('../controllers/facultyController');
const { getFacultyActionPlans, updateActionPlan } = require('../controllers/actionPlanController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['FACULTY']));

router.get('/historical', getHistoricalAnalytics);
router.get('/courses', getAssignedCourses);
router.post('/courses', createCourse);
router.get('/analytics/:courseId', getCourseAnalytics);
router.get('/courses/:courseId/details', getCourseDetails);
router.get('/courses/:courseId/pending', getPendingStudents);
router.get('/courses/:courseId/raw', getCourseRawFeedbacks);
router.post('/courses/:courseId/reminders', sendReminders);

router.post('/questions/bulk', addQuestionsBulk);
router.get('/questions/:courseId', getQuestions);
router.post('/questions', addQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

router.put('/courses/:courseId/deadline', updateCourseDeadline);

router.get('/action-plans', getFacultyActionPlans);
router.put('/action-plans/:id', updateActionPlan);

module.exports = router;
