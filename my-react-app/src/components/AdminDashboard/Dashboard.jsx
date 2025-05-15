// This implementation includes:
// 1. React frontend components for the admin dashboard
// 2. Express backend API endpoints for admin functionality
// 3. MySQL database queries for admin operations

// ==================== FRONTEND (REACT) ====================

// File: src/components/AdminDashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatsCards from './StatsCards';
import UsersList from './UsersList';
import StoresList from './StoresList';
import AddUserForm from './AddUserForm';
import AddStoreForm from './AddStoreForm';
// import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  
  useEffect(() => {
    // Check if user is authenticated as admin
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Fetch admin dashboard stats
    fetchDashboardStats();
  }, [navigate]);
  
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
       setStats({
      totalUsers: response.data.data.users,
      totalStores: response.data.data.stores,
      totalRatings: response.data.data.ratings
    });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>
            {localStorage.getItem('adminName') 
              ? localStorage.getItem('adminName') 
              : 'Admin'}
          </h2>
        </div>
        <ul className="sidebar-menu">
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </li>
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </li>
          <li 
            className={activeTab === 'stores' ? 'active' : ''} 
            onClick={() => setActiveTab('stores')}
          >
            Manage Stores
          </li>
          <li 
            className={activeTab === 'addUser' ? 'active' : ''} 
            onClick={() => setActiveTab('addUser')}
          >
            Add User
          </li>
          <li 
            className={activeTab === 'addStore' ? 'active' : ''} 
            onClick={() => setActiveTab('addStore')}
          >
            Add Store
          </li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h1>System Overview</h1>
            <StatsCards stats={stats} />
          </div>
        )}
        
        {activeTab === 'users' && <UsersList />}
        
        {activeTab === 'stores' && <StoresList />}
        
        {activeTab === 'addUser' && <AddUserForm refreshStats={fetchDashboardStats} />}
        
        {activeTab === 'addStore' && <AddStoreForm refreshStats={fetchDashboardStats} />}
      </div>
    </div>
  );
};

export default Dashboard;
