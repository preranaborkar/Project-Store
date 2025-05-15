// server.js - Entry point for our Express application
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const storeRoutes = require('./routes/store');
const ratingRoutes = require('./routes/rating');
const registrationRoutes = require('./routes/register');

// Initialize express app
const app = express();

// Middleware
// In your backend server.js file
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/registrations', registrationRoutes);


app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    const User = require('./models/user');
    const Store = require('./models/store');
    const Rating = require('./models/rating');
    
    // Get counts
    const usersCount = await User.getCount();
    const storesCount = await Store.getCount();
    const ratingsCount = await Rating.getCount();
    
    console.log('Users:', usersCount);
    console.log('Stores:', storesCount);  
    console.log('Ratings:', ratingsCount);
    
    return res.status(200).json({
      success: true,
      data: {
        users: usersCount,
        stores: storesCount,
        ratings: ratingsCount
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});



// Root route
app.get('/', (req, res) => {
  res.send('Store Rating API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



