import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StoreOwnerDashboard.css';

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Added store details state
  const [storeDetails, setStoreDetails] = useState(null);
  
  // Password update states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const navigate = useNavigate();
  
  // Get store owner details from local storage or context
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const storeId = user.store_id;
  const token = localStorage.getItem('token');
  
  // Set axios default headers with token
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  
  
  useEffect(() => {
    if (!token || !storeId) {
      navigate('/login');
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [storeId, token, navigate]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch store details
      const storeResponse = await axios.get(`http://localhost:5000/api/stores/${storeId}`);
      console.log('Store Details:', storeResponse.data.data);
      setStoreDetails(storeResponse.data.data || {});
      
      // Fetch store ratings
      const ratingsResponse = await axios.get(`http://localhost:5000/api/ratings/stores/${storeId}`);
      console.log('Ratings:', ratingsResponse.data.data);
      
      setRatings(ratingsResponse.data.data || []);
     
      // Calculate average rating
      if (ratingsResponse.data.data && ratingsResponse.data.data.length > 0) {
        const total = ratingsResponse.data.data.reduce((sum, item) => sum + item.rating, 0);
        setAverageRating((total / ratingsResponse.data.data.length).toFixed(1));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${user.id}/password`, {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        setPasswordSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    }
  };
  
  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star-filled" : "star-empty"}>
          ★
        </span>
      );
    }
    return stars;
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (loading) return <div className="loading-message">Loading dashboard...</div>;
  
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{user.name}</h1>
        <div className="header-buttons">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-primary"
          >
            Update Password
          </button>
          <button 
            onClick={handleLogout}
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Store Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Store Rating</h2>
          <div className="rating-display">
            <div className="rating-number">{averageRating}</div>
            <div className="rating-stars">
              {renderStars(Math.round(averageRating))}
            </div>
          </div>
          <p className="stat-note">Based on {ratings.length} reviews</p>
        </div>
      </div>
      
      {/* Store Details Section - NEWLY ADDED */}
      <div className="section">
        <h2>Store Details</h2>
        <div className="card store-details-card">
          {storeDetails ? (
            <div className="store-details">
              <div className="store-details-grid">
                <div className="store-detail-item">
                  <h3>Store Name</h3>
                  <p>{storeDetails.name || 'Not specified'}</p>
                </div>
                <div className="store-detail-item">
                  <h3>Contact Email</h3>
                  <p>{storeDetails.email || 'Not specified'}</p>
                </div>
                
                <div className="store-detail-item">
                  <h3>Address</h3>
                  <p>{storeDetails.address || 'Not specified'}</p>
                </div>
                
               
                
                <div className="store-detail-item">
                  <h3>Created</h3>
                  <p>{formatDate(storeDetails.created_at)}</p>
                </div>
                <div className="store-detail-item">
                  <h3>Last Updated</h3>
                  <p>{formatDate(storeDetails.updated_at)}</p>
                </div>
              </div>
              
              {storeDetails.description && (
                <div className="store-description">
                  <h3>Description</h3>
                  <p>{storeDetails.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">Store details not available</div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="section">
        <h2>Customer Reviews</h2>
        <div className="card">
          {ratings.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((rating) => (
                    <tr key={rating.id}>
                      <td>
                        <div className="user-name">{rating.user_name}</div>
                      </td>
                      <td>
                        <div className="stars">
                          {renderStars(rating.rating)}
                        </div>
                      </td>
                      <td>
                        <div>{rating.comment || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No reviews yet</div>
          )}
        </div>
      </div>
      
      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Update Password</h2>
            
            {passwordSuccess && (
              <div className="alert alert-success">
                {passwordSuccess}
              </div>
            )}
            
            {passwordError && (
              <div className="alert alert-error">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;