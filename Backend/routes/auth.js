const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register endpoint
router.post('/register',  authController.register);

// Login endpoint
router.post('/login',  authController.login);

// Protected routes
router.get('/profile', authMiddleware.authenticate, authController.getProfile);

module.exports = router;