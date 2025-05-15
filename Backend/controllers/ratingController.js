const Rating = require('../models/rating');

// Create a new rating
async function createRating(req, res) {
  try {
    const { store_id, user_id, rating, comment } = req.body;

    if (!store_id || !user_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Store ID, User ID, and rating value are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const existingRating = await Rating.findByUserAndStore(user_id, store_id);

    if (existingRating) {
      await Rating.update(existingRating.id, { rating, comment });
      const updatedRating = await Rating.findById(existingRating.id);

      return res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        data: updatedRating
      });
    }

    const ratingId = await Rating.create({ store_id, user_id, rating, comment });
    const newRating = await Rating.findById(ratingId);

    return res.status(201).json({
      success: true,
      message: 'Rating created successfully',
      data: newRating
    });
  } catch (error) {
    console.error('Rating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during rating submission'
    });
  }
}

// Get ratings for a specific store
async function getRatingsByStoreId(req, res) {
  try {
    const storeId = req.params.storeId;
    const ratings = await Rating.findByStoreId(storeId);

    return res.status(200).json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching ratings'
    });
  }
}

// Get ratings by a specific user
async function getRatingsByUserId(req, res) {
  try {
    const userId = req.params.userId;
    const ratings = await Rating.findByUserId(userId);

    return res.status(200).json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user ratings'
    });
  }
}

// Update rating
async function updateRating(req, res) {
  try {
    const ratingId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const existingRating = await Rating.findById(ratingId);

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    if (existingRating.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rating'
      });
    }

    await Rating.update(ratingId, { rating, comment });
    const updatedRating = await Rating.findById(ratingId);

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating rating'
    });
  }
}

// Delete rating
async function deleteRating(req, res) {
  try {
    const ratingId = req.params.id;
    const userId = req.user.id;

    const existingRating = await Rating.findById(ratingId);

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    if (existingRating.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating'
      });
    }

    await Rating.delete(ratingId);

    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting rating'
    });
  }
}


module.exports = {
  createRating,
  getRatingsByStoreId,
  getRatingsByUserId,
  updateRating,
  deleteRating
};
