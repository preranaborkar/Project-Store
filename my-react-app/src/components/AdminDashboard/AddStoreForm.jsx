import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';
import './AdminDashboard.css'; // Adjust the path as necessary
const AddStoreForm = ({ refreshStats }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    owner_id: '' // Changed from createdBy to owner_id to match backend
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  // Fetch all users when component mounts
 useEffect(() => {
  const fetchStoreOwners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Fetched users:', response.data.data);
      const users = response.data.data.filter(user => user.role === 'store_owner');
      setStoreOwners(users);
      
      // ✅ Add this to mark fetching complete
      setFetchingUsers(false);

    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load store owners. Please refresh the page and try again.');
    }
  };

  fetchStoreOwners();
}, []);


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
      await axios.post('http://localhost:5000/api/stores', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        owner_id: ''
      });


      setSuccess(true);

      // Refresh dashboard stats
      if (refreshStats) {
        refreshStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store. Please try again.');
      console.error('Error creating store:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-store-container">
      <h1>Add New Store</h1>

      {success && (
        <div className="success-message">
          Store created successfully!
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-store-form">
        <div className="form-group">
          <label> 
            Store Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter Store name"
          />
        </div>

        <div className="form-group">
          <label>
            
            Store Owner
          </label>
          <select
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Store Owner</option>
            {fetchingUsers ? (
              <option value="" disabled>Loading users...</option>
            ) : storeOwners.length > 0 ? (
              storeOwners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.email} ({owner.name})
                </option>
              ))
            ) : (
              <option value="" disabled>No users found</option>
            )}
          </select>

        </div>

        <div className="form-group">
          <label>
            
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Write something about the store"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>
            
            Address
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

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Store'}
        </button>
      </form>
    </div>
  );
};

export default AddStoreForm;