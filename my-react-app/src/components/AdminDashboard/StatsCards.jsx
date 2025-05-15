
// File: src/components/AdminDashboard/StatsCards.js
import React from 'react';
import { FaUsers, FaStore, FaStar } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-icon">
          <FaUsers />
        </div>
        <div className="stat-details">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FaStore />
        </div>
        <div className="stat-details">
          <h3>Total Stores</h3>
          <p>{stats.totalStores}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FaStar />
        </div>
        <div className="stat-details">
          <h3>Total Ratings</h3>
          <p>{stats.totalRatings}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;

