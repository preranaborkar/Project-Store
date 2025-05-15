
// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/auth');


// Create a new rating
router.post('/', authMiddleware.authenticate, ratingController.createRating);

// Update a rating
router.put('/:id', authMiddleware.authenticate, ratingController.updateRating);

// Get user ratings (own or by ID if admin)
router.get('/users/:userId', authMiddleware.authenticate, ratingController.getRatingsByUserId);

// Get ratings for a specific store
router.get('/stores/:storeId', authMiddleware.authenticate, ratingController.getRatingsByStoreId);

router.delete('/:id', authMiddleware.authenticate, ratingController.deleteRating);

module.exports = router;



