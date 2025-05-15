// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';
import Dashboard from './components/AdminDashboard/Dashboard';
// import './components/AdminDashboard/AdminDashboard.css';
// import './components/auth/Auth.css';
import AddUserForm from './components/AdminDashboard/AddUserForm';
import AddStoreForm from './components/AdminDashboard/AddStoreForm';
import StatsCards from './components/AdminDashboard/StatsCards';
import UsersList from './components/AdminDashboard/UsersList';
import StoresList from './components/AdminDashboard/StoresList';
import StoreListsforuser from './components/UserDashboard/StoreListsforuser';
import StoreOwnerDashboard from './components/StoreOwnerDashboard/StoreOwnerDashboard';

// import './components/AdminDashboard/Stores.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/stats" element={<StatsCards />} />
          <Route path="/dashboard/users" element={<UsersList />} />
          <Route path="/dashboard/stores" element={<StoresList />} />
          <Route path="/dashboard/add-user" element={<AddUserForm />} />
          <Route path="/dashboard/add-store" element={<AddStoreForm />} />
          <Route path="/dashboard" element={<StoreListsforuser />} />
         <Route path="/storeowner/dashboard" element={<StoreOwnerDashboard />} />
         <Route path="/" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;