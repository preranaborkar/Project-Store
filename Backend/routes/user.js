const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware.authenticate);

// Routes accessible by regular users
router.get('/profile', userController.getUserProfile);
router.put('/:id/password', userController.updatePassword);

// Admin only routes
router.post('/', roleMiddleware.adminOnly, userController.createUser);
router.get('/', roleMiddleware.adminOnly, userController.getAllUsers);
router.get('/count', roleMiddleware.adminOnly, userController.getUsersCount);
router.get('/:id',  userController.getUserById);
router.put('/:id', roleMiddleware.adminOnly, userController.updateUser);
router.delete('/:id', roleMiddleware.adminOnly, userController.deleteUser);

module.exports = router;