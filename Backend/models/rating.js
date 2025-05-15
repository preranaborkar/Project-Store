// models/Rating.js
const db = require('../config/db');
const { get } = require('../routes/user');
const { getCount } = require('./user');

const Rating = {
  // Create a new rating
  create: async (ratingData) => {
    const [result] = await db.query(
      'INSERT INTO ratings (store_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [ratingData.store_id, ratingData.user_id, ratingData.rating, ratingData.comment || null]
    );
    return result.insertId;
  },
  
  // Find rating by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM ratings WHERE id = ?', [id]);
    return rows[0];
  },
  
  // Find ratings by user ID
  findByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM ratings WHERE user_id = ?', [userId]);
    return rows;
  },
  
  // Find ratings by store ID
  findByStoreId: async (storeId) => {
    const [rows] = await db.query('SELECT r.*, u.name as user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = ?', [storeId]);
    return rows;
  },
  
  // Find a specific rating by user and store
  findByUserAndStore: async (userId, storeId) => {
    const [rows] = await db.query('SELECT * FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    return rows[0];
  },
  
  // Update a rating
  update: async (id, ratingData) => {
    const [result] = await db.query(
      'UPDATE ratings SET rating = ?, comment = ? WHERE id = ?',
      [ratingData.rating, ratingData.comment || null, id]
    );
    return result.affectedRows;
  },
  
  // Delete a rating
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM ratings WHERE id = ?', [id]);
    return result.affectedRows;
  },

  //get count of ratings
  getCount: async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM ratings');
    return rows[0].count;
  },
};

module.exports = Rating;