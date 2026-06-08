const express = require('express');
const { login, signup, getProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/profile', requireAuth, getProfile);

module.exports = router;
