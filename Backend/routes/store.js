const express = require('express');
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

const router = express.Router();

// Get all stores - public route
router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);

// Protected routes
router.use(authMiddleware.authenticate);

// Create store - admin or normal user can create
router.post('/', storeController.createStore);

// Admin only routes
router.get('/admin/count', roleMiddleware.adminOnly, storeController.getStoresCount);
router.put('/:id', storeController.updateStore); // Controller handles permission check
router.delete('/:id', roleMiddleware.adminOnly, storeController.deleteStore);

module.exports = router;