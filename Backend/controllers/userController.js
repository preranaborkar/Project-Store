const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Store = require('../models/store');

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    console.log("Creating user with data:", req.body);
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with specified role
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'user'
    });
    
    // Get user without password
    const user = await User.findById(userId);
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during user creation'
    });
  }
};

// Get all users with optional filtering
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users');
     // Extract filters from query parameters
    const filters = {
      name: req.query.name || '',
      email: req.query.email || '',
      address: req.query.address || '',
      role: req.query.role || ''
    };
    // Get users
    const users = await User.findAll(filters);
    
    // console.log('Users:', users);
    
    // Enhance store owner users with their store information
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      if (user.role === 'store_owner') {
        const stores = await Store.findByOwnerId(user.id);
        // Calculate average rating across all stores owned by this user
        let totalRating = 0;
        let storeCount = 0;
        
        stores.forEach(store => {
          if (store.average_rating > 0) {
            totalRating += parseFloat(store.average_rating);
            storeCount++;
          }
        });
        
        const averageRating = storeCount > 0 ? (totalRating / storeCount).toFixed(1) : 0;
       
        return {
          ...user,
          stores,
          rating: averageRating
        };
      }
      return user;
    }));
   
    console.log('Enhanced users:', enhancedUsers);
    return res.status(200).json({
      success: true,
      count: enhancedUsers.length,
      data: enhancedUsers
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    console.log('Fetching user by ID:', req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If store owner, include store information and rating
    if (user.role === 'store_owner') {
      const stores = await Store.findByOwnerId(user.id);
      // Calculate average rating across all stores
      let totalRating = 0;
      let storeCount = 0;
      
      stores.forEach(store => {
        if (store.average_rating > 0) {
          totalRating += parseFloat(store.average_rating);
          storeCount++;
        }
      });
      
      const averageRating = storeCount > 0 ? (totalRating / storeCount).toFixed(1) : 0;
      
      
      return res.status(200).json({
        success: true,
        data: {
          ...user,
          stores,
          rating: averageRating
        }
      });
    }
    
    console.log('User found:', user);
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};




// Get current user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove sensitive data before sending
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, address, role } = req.body;
    const userId = req.params.id;
    
    // Get user to check if exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (role && req.user.role === 'admin') updateData.role = role;  // Only admin can change roles
    
    await User.update(userId, updateData);
    
    // Get updated user
    const updatedUser = await User.findById(userId);
    
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    await User.delete(userId);
    
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// Get users count
exports.getUsersCount = async (req, res) => {
  try {
    const count = await User.getCount();
    
    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get users count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user count'
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
   
    console.log('Updating password for user:', userId);
    
    
    
    const { currentPassword, newPassword } = req.body;
    
    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Get user with password
    const user = await User.findById(userId);
    console.log('User found:', user);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  console.log("Current password sent by user:", currentPassword);
console.log("Hashed password in DB:", user.password);

    // const currentPassword1 = currentPassword.trim();
    
    // // Verify current password
    // const isPasswordValid = await bcrypt.compare(currentPassword1, user.password);
    
    // if (!isPasswordValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Current password is incorrect'
    //   });
    // }
    // console.log('Current password is valid');
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    await User.updatePassword(userId, hashedPassword);
    
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }
};
