const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

// Load env vars from a specific path
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Set default values for important environment variables
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (!process.env.PORT) process.env.PORT = 5000;
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'bookstore_secret_key_secure123';
if (!process.env.JWT_EXPIRE) process.env.JWT_EXPIRE = '30d';
if (!process.env.GOOGLE_BOOKS_API_KEY) process.env.GOOGLE_BOOKS_API_KEY = 'AIzaSyBQjIKzpP37qNeEBYbF1ZuYCDIB0xY8UbQ';
if (!process.env.MONGO_URI) process.env.MONGO_URI = 'mongodb+srv://banithamadu12:banitha123456@cluster0.rx9y2bx.mongodb.net/bookstore?retryWrites=true&w=majority';

// Connect to database
const dbConnection = connectDB();

// Track database connection status
let isDbConnected = false;

// Set database connection status after connection attempt
dbConnection.then(conn => {
  isDbConnected = !!conn;
}).catch(() => {
  isDbConnected = false;
});

// Create a middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!isDbConnected && process.env.NODE_ENV === 'development') {
    // In development, return mock data or appropriate message
    return res.status(503).json({
      success: false,
      message: 'Database connection is not available. Please check MongoDB Atlas connection and IP whitelist.'
    });
  }
  next();
};

// Route files
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const userRoutes = require('./src/routes/userRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', checkDbConnection, authRoutes);
app.use('/api/books', checkDbConnection, bookRoutes);
app.use('/api/users', checkDbConnection, userRoutes);
app.use('/api/cart', checkDbConnection, cartRoutes);
app.use('/api/orders', checkDbConnection, orderRoutes);
app.use('/api/reviews', checkDbConnection, reviewRoutes);
// Reviews can be accessed through books as well
app.use('/api/books/:bookId/reviews', checkDbConnection, reviewRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Bookstore API',
    dbStatus: isDbConnected ? 'Connected' : 'Disconnected',
    author: 'Your Name',
    version: '1.0.0'
  });
});

// Error handler middleware
app.use(notFound);
app.use(errorHandler);

// Use a different port if the default port is already in use
let PORT = parseInt(process.env.PORT) || 5000;
let server;

const startServer = () => {
  server = app.listen(PORT)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use, trying port ${PORT + 1}`);
        PORT += 1;
        startServer();
      } else {
        console.error('Error starting server:', err);
        process.exit(1);
      }
    })
    .on('listening', () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`MongoDB Connection: ${process.env.MONGO_URI}`);
    });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
}); 