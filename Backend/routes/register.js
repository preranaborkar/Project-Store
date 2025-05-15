
// routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const Registration = require('../controllers/registrationController');
const authMiddleware = require('../middleware/auth');

// Create new registration
router.post('/', authMiddleware.authenticate, Registration.createRegistration);

// Get user's registrations
router.get('/:userId/registrations', authMiddleware.authenticate, Registration.getUserRegistrations);

// delete registration
router.delete('/:id', authMiddleware.authenticate, Registration.deleteRegistration);


module.exports = router;

// Add this in your main app.js or index.js file:
