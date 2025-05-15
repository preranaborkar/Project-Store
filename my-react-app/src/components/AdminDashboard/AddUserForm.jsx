
// File: src/components/AdminDashboard/AddUserForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';

const AddUserForm = ({ refreshStats }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user' // Default role
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: ''
      });
      
      setSuccess(true);
      
      // Refresh dashboard stats
      if (refreshStats) {
        refreshStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-user-container">
      <h1>Add New User</h1>
      
      {success && (
        <div className="success-message">
          User created successfully!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label>
           
            Full Name:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
          />
        </div>
        
        <div className="form-group">
          <label>
           
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
          />
        </div>
        
        <div className="form-group">
          <label>
           
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter password"
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label>
            
            Address:
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Enter address"
          />
        </div>
        
        <div className="form-group">
          <label>
            
            Role:
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="store_owner">storeOwner</option>
          </select>
        </div>
        
        <button 
          type="submit"  
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;
