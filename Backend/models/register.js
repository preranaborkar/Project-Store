// models/Registration.js
const db = require('../config/db');

const Registration = {
  // Create a new registration
  create: async (registrationData) => {
    const [result] = await db.query(
      'INSERT INTO registrations (store_id, user_id) VALUES (?, ?)',
      [registrationData.store_id, registrationData.user_id]
    );
    return result.insertId;
  },

  // Find registration by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM registrations WHERE id = ?', [id]);
    return rows[0];
  },

  // Find registrations by user ID
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT r.*, s.name as store_name FROM registrations r JOIN stores s ON r.store_id = s.id WHERE r.user_id = ?', 
      [userId]
    );
    return rows;
  },

  // Find registrations by store ID
  findByStoreId: async (storeId) => {
    const [rows] = await db.query(
      'SELECT r.*, u.name as user_name FROM registrations r JOIN users u ON r.user_id = u.id WHERE r.store_id = ?', 
      [storeId]
    );
    return rows;
  },

  // Check if user is registered to a store
  isUserRegistered: async (userId, storeId) => {
    const [rows] = await db.query(
      'SELECT * FROM registrations WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    return rows.length > 0;
  },

  // Delete a registration
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM registrations WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Registration;