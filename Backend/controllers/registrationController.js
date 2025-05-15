const Registration = require('../models/register');

// Create a new registration
exports.createRegistration = async (req, res) => {
  try {
    const { store_id, user_id } = req.body;

    if (!store_id || !user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Store ID and User ID are required' 
      });
    }

    // Use isUserRegistered instead of findExistingRegistration
    const existingReg = await Registration.isUserRegistered(user_id, store_id);

    if (existingReg) {
      return res.status(409).json({ 
        success: false, 
        message: 'User is already registered to this store' 
      });
    }

    const result = await Registration.create({
      store_id,
      user_id
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered to store',
      data: {
        id: result,
        store_id,
        user_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Get all registrations for a user
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching registrations for user:', userId);

    const rows = await Registration.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching registrations'
    });
  }
};

//write api for deleting registration
exports.deleteRegistration = async (req, res) => {   
  try {
    const id=req.params.id;
    
   
    const result = await Registration.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }
   

    res.status(200).json({
      success: true,
      message: 'Successfully deleted registration'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting registration'
    });
  }

}
