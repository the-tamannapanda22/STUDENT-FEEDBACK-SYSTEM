const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadFeedback, getAnalysis } = require('../controllers/manualFeedbackController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin only: upload manual feedback files
router.post('/upload', requireAuth, requireRole(['ADMIN']), upload.array('files', 3), uploadFeedback);

// Admin & Faculty: get analysis results
router.get('/analysis', requireAuth, requireRole(['ADMIN', 'FACULTY']), getAnalysis);

module.exports = router;
