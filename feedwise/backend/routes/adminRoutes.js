const express = require('express');
const { 
  createCourse, getCourses, deleteCourse, updateCourse,
  getUsers, deleteUser, createFaculty, updateStudent, updateFaculty,
  getGlobalStats,
  getQuestions, addQuestion, deleteQuestion, updateQuestion, addQuestionsBulk,
  promoteStudents, resetAllFeedback, deleteStudentsBySemester,
  getAdminCourseAnalytics,
  getCourseRawFeedbacks,
  getStudentPending,
  remindAllStudents,
  getFeedbackCount
} = require('../controllers/adminController');
const { getAdminActionPlans } = require('../controllers/actionPlanController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['ADMIN']));

// Course routes
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.get('/courses/:courseId/raw', getCourseRawFeedbacks);

// User routes
router.get('/users', getUsers);
router.post('/faculty', createFaculty);
router.put('/faculty/:id', updateFaculty);
router.put('/students/:id', updateStudent);
router.delete('/users/:id', deleteUser);

router.get('/students/:id/pending', getStudentPending);
router.post('/students/reminders', remindAllStudents);

// Question routes
router.post('/questions/bulk', addQuestionsBulk);
router.get('/questions/:courseId', getQuestions);
router.post('/questions', addQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Stats
router.get('/stats', getGlobalStats);

// Bulk operations
router.post('/students/promote', promoteStudents);
router.post('/feedback/reset', resetAllFeedback);
router.post('/students/delete-by-semester', deleteStudentsBySemester);

// Feedback count map (studentId -> number of feedbacks submitted)
router.get('/feedback-count', getFeedbackCount);

// Analytics — admin can view any course without ownership check
router.get('/analytics/:courseId', getAdminCourseAnalytics);

// Action Plans
router.get('/action-plans', getAdminActionPlans);

module.exports = router;
