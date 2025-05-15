import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaEdit, FaStore, FaSignOutAlt, FaUser, FaLock, FaPlus, FaCheck, FaTimes, FaMapMarkerAlt, FaHistory } from 'react-icons/fa';
import './Stores.css'; // Import your CSS file for styling

const StoreListsForUser = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [registeredStores, setRegisteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState({ name: '', address: '' });
  const [userRatings, setUserRatings] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'registered', or 'myRatings'
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showRatingSelector, setShowRatingSelector] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [allUserRatings, setAllUserRatings] = useState([]);

  // Get logged in user from local storage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Fetch all stores and user registrations when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all stores
        const storesResponse = await fetch('http://localhost:5000/api/stores', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!storesResponse.ok) throw new Error('Failed to fetch stores');
        const storesData = await storesResponse.json();
        const allStores = storesData.data || [];
        
        setStores(allStores);
        setFilteredStores(allStores);
        
        // Fetch user's registered stores
        const registrationsResponse = await fetch(`http://localhost:5000/api/registrations/${userId}/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (registrationsResponse.ok) {
          const registrationsData = await registrationsResponse.json();
          setRegisteredStores(registrationsData.data || []);
        }
        
        // Fetch user's ratings for these stores
        await fetchUserRatings(token);
        
        // Fetch user profile info
        const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.data) {
            setUserProfile(userData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  // Fetch user ratings
  const fetchUserRatings = async (token) => {
    try {
      const ratingsResponse = await fetch(`http://localhost:5000/api/ratings/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        const userRatingsList = ratingsData.data || [];
        
        // Set all user ratings for the ratings tab
        setAllUserRatings(userRatingsList);
        
        // Convert array of ratings to object with store_id as key
        const userRatingsMap = {};
        userRatingsList.forEach(rating => {
          userRatingsMap[rating.store_id] = rating;
        });
        
        setUserRatings(userRatingsMap);
      }
    } catch (err) {
      console.error('Error fetching user ratings:', err);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter stores based on search query and active tab
  useEffect(() => {
    const { name, address } = searchQuery;
    
    if (activeTab === 'myRatings') {
      // When on My Ratings tab, we don't filter stores
      return;
    }
    
    let storesToFilter = stores;
    if (activeTab === 'registered') {
      // Filter to only show registered stores
      storesToFilter = stores.filter(store => 
        registeredStores.some(reg => reg.store_id === store.id)
      );
    }
    
    if (!name && !address) {
      setFilteredStores(storesToFilter);
      return;
    }
    
    const filtered = storesToFilter.filter(store => {
      const nameMatch = !name || store.name.toLowerCase().includes(name.toLowerCase());
      const addressMatch = !address || store.address.toLowerCase().includes(address.toLowerCase());
      return nameMatch && addressMatch;
    });
    
    setFilteredStores(filtered);
  }, [searchQuery, stores, activeTab, registeredStores]);

  // Handle star mouse enter for visual feedback
  const handleStarHover = (storeId, rating) => {
    setHoverRating(prev => ({
      ...prev,
      [storeId]: rating
    }));
  };

  // Handle mouse leave for visual feedback
  const handleStarLeave = (storeId) => {
    setHoverRating(prev => ({
      ...prev,
      [storeId]: 0
    }));
  };
  
  // Handle submit rating
  const handleRatingSubmit = async (storeId, rating) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if user already has a rating for this store
      if (userRatings[storeId]) {
        // Update existing rating
        await fetch(`http://localhost:5000/api/ratings/${userRatings[storeId].id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ rating })
        });
      } else {
        // Create new rating
        await fetch('http://localhost:5000/api/ratings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            store_id: storeId, 
            rating,
            user_id: userId 
          })
        });
      }
      
      // Update user ratings
      await fetchUserRatings(token);
      
      // Refresh store list to get updated average ratings
      const storesResponse = await fetch('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (storesResponse.ok) {
        const storesData = await storesResponse.json();
        setStores(storesData.data || []);
      }
      
      // Hide rating selector after submission
      toggleRatingSelector(storeId);
      
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Handle store registration
  const handleRegisterToStore = async (storeId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Register user to store
      await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          store_id: storeId,
          user_id: userId 
        })
      });
      
      // Refresh registered stores
      const registrationsResponse = await fetch(`http://localhost:5000/api/registrations/${userId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json();
        setRegisteredStores(registrationsData.data || []);
      }
      
    } catch (err) {
      console.error('Error registering to store:', err);
      alert('Failed to register to store. Please try again.');
    }
  };

  // Handle store unregistration
  const handleUnregisterFromStore = async (storeId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the registration ID
      const registration = registeredStores.find(reg => reg.store_id === storeId);
      if (!registration) return;
      
      // Unregister user from store
      await fetch(`http://localhost:5000/api/registrations/${registration.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update registered stores
      setRegisteredStores(prev => prev.filter(reg => reg.store_id !== storeId));
      
    } catch (err) {
      console.error('Error unregistering from store:', err);
      alert('Failed to unregister from store. Please try again.');
    }
  };

  // Toggle rating selector visibility
  const toggleRatingSelector = (storeId) => {
    setShowRatingSelector(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  };

  // Handle deleting a rating
  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Refresh ratings after deletion
        await fetchUserRatings(token);
        
        // Also refresh stores to update average ratings
        const storesResponse = await fetch('http://localhost:5000/api/stores', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          setStores(storesData.data || []);
        }
      }
    } catch (err) {
      console.error('Error deleting rating:', err);
      alert('Failed to delete rating. Please try again.');
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? "star-filled" : "star-empty"} 
        />
      );
    }
    return stars;
  };

  // Render interactive rating stars
  const renderInteractiveStars = (storeId) => {
    const currentRating = userRatings[storeId]?.rating || 0;
    const hoverValue = hoverRating[storeId] || 0;
    
    return (
      <div className="interactive-stars">
        {[1, 2, 3, 4, 5].map(value => (
          <FaStar 
            key={value} 
            className={`rating-star ${value <= (hoverValue || currentRating) ? "star-filled" : "star-empty"}`}
            onClick={() => handleRatingSubmit(storeId, value)}
            onMouseEnter={() => handleStarHover(storeId, value)}
            onMouseLeave={() => handleStarLeave(storeId)}
          />
        ))}
      </div>
    );
  };

  // Handle password update input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate password update form
  const validatePasswordUpdate = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password update submission
  const handlePasswordSubmit = async () => {
    if (!validatePasswordUpdate()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      alert('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordErrors({ general: err.message });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  };

  // Check if store is registered by user
  const isStoreRegistered = (storeId) => {
    return registeredStores.some(reg => reg.store_id === storeId);
  };

  // Find store name by ID
  const getStoreNameById = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading stores...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <div className="error-icon">
            <FaTimes />
          </div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* User Navigation Bar */}
      <div className="navbar">
        <div className="navbar-container">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <span className="user-name">{userProfile.name || user.name || 'User'}</span>
              <p className="user-welcome">Welcome back!</p>
            </div>
          </div>
          <div className="navbar-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              <FaLock className="btn-icon" />
              Update Password
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="btn-icon" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="main-container">
        <h1 className="page-title">Store Listings</h1>
        
        {/* Tab Navigation */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Stores
            </button>
            <button 
              className={`tab-button ${activeTab === 'registered' ? 'active' : ''}`}
              onClick={() => setActiveTab('registered')}
            >
              My Registered Stores
            </button>
            <button 
              className={`tab-button ${activeTab === 'myRatings' ? 'active' : ''}`}
              onClick={() => setActiveTab('myRatings')}
            >
              <FaHistory className="tab-icon" />
              My Ratings
            </button>
          </div>
        </div>
        
        {/* Search Form - Only show for store tabs */}
        {activeTab !== 'myRatings' && (
          <div className="search-container">
            <div className="search-input-wrapper">
              <div className="search-icon">
                <FaSearch />
              </div>
              <input
                type="text"
                name="name"
                value={searchQuery.name}
                onChange={handleSearchChange}
                placeholder="Search by store name"
                className="search-input"
              />
            </div>
            
            <div className="search-input-wrapper">
              <div className="search-icon">
                <FaMapMarkerAlt />
              </div>
              <input
                type="text"
                name="address"
                value={searchQuery.address}
                onChange={handleSearchChange}
                placeholder="Search by address"
                className="search-input"
              />
            </div>
          </div>
        )}
        
        {/* My Ratings Tab Content */}
        {activeTab === 'myRatings' && (
          <div className="ratings-history">
            <h2 className="section-title">Your Rating History</h2>
            
            {allUserRatings.length === 0 ? (
              <div className="no-results">
                <FaStar className="no-results-icon" />
                <h3 className="no-results-title">You haven't rated any stores yet</h3>
                <p className="no-results-text">Browse stores and add ratings to see them here.</p>
              </div>
            ) : (
              <div className="ratings-list">
                {allUserRatings.map(rating => (
                  <div key={rating.id} className="rating-history-card">
                    <div className="rating-store-info">
                      <div className="store-icon">
                        <FaStore />
                      </div>
                      <h3 className="store-name">{getStoreNameById(rating.store_id)}</h3>
                    </div>
                    
                    <div className="rating-details">
                      <div className="rating-stars">
                        {renderStars(rating.rating)}
                      </div>
                      <div className="rating-date">
                        Rated on: {new Date(rating.created_at).toLocaleDateString()}
                      </div>
                      
                      {rating.comment && (
                        <div className="rating-comment">
                          "{rating.comment}"
                        </div>
                      )}
                    </div>
                    
                    <div className="rating-actions">
                      <button 
                        className="btn btn-edit-rating"
                        onClick={() => {
                          // Find the store and navigate to it
                          const store = stores.find(s => s.id === rating.store_id);
                          if (store) {
                            setActiveTab('all');
                            setTimeout(() => {
                              const storeElement = document.getElementById(`store-${store.id}`);
                              if (storeElement) {
                                storeElement.scrollIntoView({ behavior: 'smooth' });
                                toggleRatingSelector(store.id);
                              }
                            }, 100);
                          }
                        }}
                      >
                        <FaEdit className="btn-icon" />
                        Edit Rating
                      </button>
                      
                      <button 
                        className="btn btn-delete-rating"
                        onClick={() => handleDeleteRating(rating.id)}
                      >
                        <FaTimes className="btn-icon" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Store Listings - Only show for non-ratings tabs */}
        {activeTab !== 'myRatings' && (
          <>
            {filteredStores.length === 0 ? (
              <div className="no-results">
                <FaStore className="no-results-icon" />
                <h3 className="no-results-title">
                  {activeTab === 'registered' 
                    ? "You haven't registered to any stores yet." 
                    : "No stores found matching your search criteria."}
                </h3>
                <p className="no-results-text">
                  {activeTab === 'registered' 
                    ? "Browse all stores and register to see them here." 
                    : "Try adjusting your search or browse all available stores."}
                </p>
              </div>
            ) : (
              <div className="stores-grid">
                {filteredStores.map(store => (
                  <div key={store.id} id={`store-${store.id}`} className="store-card">
                    <div className="store-header">
                      <div className="store-title-section">
                        <div className="store-icon">
                          <FaStore />
                        </div>
                        <h2 className="store-name">{store.name}</h2>
                      </div>
                      
                      <div className="store-address">
                        <FaMapMarkerAlt className="address-icon" />
                        <span>{store.address}</span>
                      </div>
                      
                      <div className="store-actions">
                        {isStoreRegistered(store.id) ? (
                          <button 
                            className="btn btn-registered"
                            onClick={() => handleUnregisterFromStore(store.id)}
                          >
                            <FaCheck className="btn-icon" />
                            Registered
                          </button>
                        ) : (
                          <button 
                            className="btn btn-register"
                            onClick={() => handleRegisterToStore(store.id)}
                          >
                            <FaPlus className="btn-icon" />
                            Register
                          </button>
                        )}
                        
                        <div className="store-rating">
                          <div className="stars">
                            {renderStars(store.average_rating || 0)}
                          </div>
                          <span className="rating-count">
                            ({store.rating_count || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="store-footer">
                      <div className="user-rating-section">
                        <h3 className="rating-title">Your Rating:</h3>
                        {userRatings[store.id] ? (
                          <div className="user-rating">
                            <div className="stars">
                              {renderStars(userRatings[store.id].rating)}
                            </div>
                            <button 
                              className="edit-rating-btn"
                              onClick={() => toggleRatingSelector(store.id)}
                              aria-label="Edit rating"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        ) : (
                          <div className="user-rating">
                            <div className="no-rating">Not rated yet</div>
                            <button 
                              className="edit-rating-btn"
                              onClick={() => toggleRatingSelector(store.id)}
                              aria-label="Add rating"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {showRatingSelector[store.id] && (
                        <div className="rating-selector-container">
                          <div className="rating-selector-header">
                            <h3 className="rating-selector-title">
                              {userRatings[store.id] ? 'Edit your rating:' : 'Rate this store:'}
                            </h3>
                            <button 
                              className="close-rating-btn"
                              onClick={() => toggleRatingSelector(store.id)}
                              aria-label="Close rating selector"
                            >
                              <FaTimes />
                            </button>
                          </div>
                          {renderInteractiveStars(store.id)}
                          <p className="rating-instructions">Click on a star to submit your rating</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Update Password</h2>
            
            {passwordErrors.general && (
              <div className="error-alert">
                <div className="error-alert-content">
                  <FaTimes className="error-alert-icon" />
                  <span>{passwordErrors.general}</span>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <div className="input-with-icon">
                <div className="input-icon">
                  <FaLock />
                </div>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                />
              </div>
              {passwordErrors.currentPassword && (
                <div className="error-text">{passwordErrors.currentPassword}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <div className="input-with-icon">
                <div className="input-icon">
                  <FaLock />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.newPassword ? 'input-error' : ''}`}
                />
              </div>
              {passwordErrors.newPassword && (
                <div className="error-text">{passwordErrors.newPassword}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <div className="input-with-icon">
                <div className="input-icon">
                  <FaLock />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                />
              </div>
              {passwordErrors.confirmPassword && (
                <div className="error-text">{passwordErrors.confirmPassword}</div>
              )}
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
                type="button"
                onClick={handlePasswordSubmit}
                className="btn btn-primary"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreListsForUser;