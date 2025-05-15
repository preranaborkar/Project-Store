const db = require('../config/db');

const Store = {
  // Create a new store
  create: async (storeData) => {
    const [result] = await db.query(
      'INSERT INTO stores (name, description, address, owner_id) VALUES (?, ?, ?, ?)',
      [storeData.name, storeData.description, storeData.address, storeData.owner_id]
    );
    return result.insertId;
  },
  
  // Find store by ID
  findById: async (id) => {
    const [rows] = await db.query(`
      SELECT s.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as rating_count 
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    return rows[0];
  },
  
  // Find store by owner ID
  findByOwnerId: async (ownerId) => {
    const [rows] = await db.query(`
      SELECT s.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as rating_count 
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [ownerId]);
    return rows;
  },
  
  // Get all stores with average rating
  findAll: async (filters = {}) => {
    let query = `
      SELECT s.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as rating_count 
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    
    if (filters.email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${filters.email}%`);
    }
    
    if (filters.address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${filters.address}%`);
    }
    
    query += ' GROUP BY s.id';
    
    const [rows] = await db.query(query, params);
    return rows;
  },
  
  // Get total number of stores
  getCount: async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM stores');
    return rows[0].count;
  },
  
  // Update a store
  update: async (id, storeData) => {
    const fields = [];
    const params = [];
    
    Object.keys(storeData).forEach(key => {
      if (key !== 'id' && key !== 'owner_id') {
        fields.push(`${key} = ?`);
        params.push(storeData[key]);
      }
    });
    
    params.push(id);
    
    const [result] = await db.query(
      `UPDATE stores SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    
    return result.affectedRows;
  },
  
  // Delete a store
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM stores WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Store;