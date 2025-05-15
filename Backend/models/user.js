const db = require('../config/db');

const User = {
  // Create a new user
  create: async (userData) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [userData.name, userData.email, userData.password, userData.address, userData.role || 'user']
    );
    return result.insertId;
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT id, name, email, address, role,password FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // Get all users
  findAll: async (filters = {}) => {
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];

    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      query += ' AND address LIKE ?';
      params.push(`%${filters.address}%`);
    }

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get total number of users
  getCount: async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  },

  // Update a user
  update: async (id, userData) => {
    const fields = [];
    const params = [];

    Object.keys(userData).forEach(key => {
      if (key !== 'id' && key !== 'password') {
        fields.push(`${key} = ?`);
        params.push(userData[key]);
      }
    });

    // Handle password update separately if provided
    if (userData.password) {
      fields.push('password = ?');
      params.push(userData.password);
    }

    params.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return result.affectedRows;
  },

  // Delete a user
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
,
  // Update user's password
updatePassword: async (id, newPassword) => {
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, id]
    );
    return result.affectedRows;
  }

};

module.exports = User;