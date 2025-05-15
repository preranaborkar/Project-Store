
// File: src/components/AdminDashboard/StoresList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaStar } from 'react-icons/fa';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [selectedStore, setSelectedStore] = useState(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...stores];

    // Apply filters
    if (filters.name) {
      result = result.filter(store =>
        store.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.email) {
      result = result.filter(store =>
        (store.email || '').toLowerCase().includes(filters.email.toLowerCase())
      );
    }


    if (filters.address) {
      result = result.filter(store =>
        store.address.toLowerCase().includes(filters.address.toLowerCase())
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

    setFilteredStores(result);
  }, [stores, filters, sortField, sortDirection]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(response.data.data);          
      setFilteredStores(response.data.data);  

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch stores. Please try again later.');
      setLoading(false);
      console.error('Error fetching stores:', err);
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



  const renderStarRating = (rating) => {
    if (!rating) return 'No ratings yet';

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star-filled" />
        ))}

        {hasHalfStar && <FaStar className="star-half" />}

        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="star-empty" />
        ))}

        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading stores...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stores-list-container">
      <h1>Manage Stores</h1>

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
      </div>

      <table className="stores-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </th>
            <th onClick={() => handleSort('email')}>
              Email {getSortIcon('email')}
            </th>
            <th onClick={() => handleSort('description')}>
              Description {getSortIcon('description')}
            </th>
            <th onClick={() => handleSort('address')}>
              Address {getSortIcon('address')}
            </th>
            <th onClick={() => handleSort('rating')}>
              Rating {getSortIcon('rating')}
            </th>

          </tr>
        </thead>
        <tbody>
          {filteredStores.map(store => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.email}</td>
              <td>{store.description}</td>
              <td>{store.address}</td>
              <td>{renderStarRating(store.rating)}</td>

            </tr>
          ))}
        </tbody>
      </table>

      {filteredStores.length === 0 && (
        <div className="no-results">No stores found matching the filters.</div>
      )}


    </div>
  );
};

export default StoresList;
