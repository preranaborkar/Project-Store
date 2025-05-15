const Store = require('../models/store');
const Rating = require('../models/rating');
const User = require('../models/user');

// Create a new store
exports.createStore = async (req, res) => {
  try {
    const { name, description, address } = req.body;
    
    // Only admin can set owner_id, otherwise use the current user's ID
    const storeOwnerId =  req.userId;
    
    // Create the store
    const storeId = await Store.create({
      name,
      description,
      address,
      owner_id: storeOwnerId
    });
    
    // Get the created store
    const store = await Store.findById(storeId);
    
    return res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store
    });
  } catch (error) {
    console.error('Create store error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating store'
    });
  }
};

// Get all stores with optional filtering
exports.getAllStores = async (req, res) => {
  try {
    const { name, email, address } = req.query;
    
    // Apply filters if provided
    const filters = {};
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;
    
    // Get stores
    const stores = await Store.findAll(filters);
    
    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching stores'
    });
  }
};

// Get store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Get ratings for the store
    const ratings = await Rating.findByStoreId(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: {
        ...store,
        ratings
      }
    });
  } catch (error) {
    console.error('Get store by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching store'
    });
  }
};

// Update store
exports.updateStore = async (req, res) => {
  try {
    const { name, description, address } = req.body;
    const storeId = req.params.id;
    
    // Get the store to check permissions
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Check if user is admin or the store owner
    if (req.user.role !== 'admin' && store.owner_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Update the store
    await Store.update(storeId, { name, description, address });
    
    // Get the updated store
    const updatedStore = await Store.findById(storeId);
    
    return res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore
    });
  } catch (error) {
    console.error('Update store error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating store'
    });
  }
};

// Delete store
exports.deleteStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    
    // Get the store to check permissions
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Only admin can delete stores
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Delete the store
    await Store.delete(storeId);
    
    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Delete store error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting store'
    });
  }
};

// Get stores count
exports.getStoresCount = async (req, res) => {
  try {
    const count = await Store.getCount();
    
    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get stores count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching store count'
    });
  }
};

exports.getStoresByOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const stores = await Store.findByOwnerId(userId);
    
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (err) {
    console.error('Error in getStoresByOwner:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};