// File: src/components/AdminDashboard/UsersList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...users];


    // Apply filters
    if (filters.name) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.email) {
      result = result.filter(user =>
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.address) {
      result = result.filter(user =>
        user.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }

    if (filters.role) {
      result = result.filter(user =>
        user.role.toLowerCase() === filters.role.toLowerCase()
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(result);
  }, [users, filters, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.data || response.data);
      setFilteredUsers(response.data.data || response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
      console.error('Error fetching users:', err.response || err); // Log the error response
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="users-list-container">
      <h1>Manage Users</h1>

      <div className="filters-container">
        <div className="filter-item">
          <label>Name:</label>
          <div className="search-input">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Filter by name"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>Email:</label>
          <div className="search-input">
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Filter by email"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>Address:</label>
          <div className="search-input">
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Filter by address"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>Role:</label>
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
            <option value="user">Normal User</option>
          </select>
        </div>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
            <th onClick={() => handleSort('email')}>Email {getSortIcon('email')}</th>
            <th onClick={() => handleSort('address')}>Address {getSortIcon('address')}</th>
            <th onClick={() => handleSort('role')}>Role {getSortIcon('role')}</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.user_id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
        
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal or Side Panel for User Details */}
      {showUserDetails && selectedUser && (
        <div className="user-details-modal">
          <div className="user-details-content">
            <h2>User Details</h2>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>
            <p><strong>Phone:</strong> {selectedUser.phone_number || 'N/A'}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            {/* Add more details if needed */}
            <button onClick={closeUserDetails}>Close</button>
          </div>
        </div>
      )}


      {filteredUsers.length === 0 && (
        <div className="no-results">No users found matching the filters.</div>
      )}

      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="user-details-modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={closeUserDetails} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedUser.address}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">
                  {selectedUser.role === 'store' ? 'Store Owner' :
                    selectedUser.role === 'admin' ? 'Admin' : 'Normal User'}
                </span>
              </div>

              {selectedUser.role === 'store' && (
                <div className="detail-item">
                  <span className="detail-label">Store Rating:</span>
                  <span className="detail-value">
                    {selectedUser.rating ? `${selectedUser.rating}/5` : 'No ratings yet'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
