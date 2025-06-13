const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use hardcoded MongoDB URI if environment variable is not available
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://banithamadu12:banitha123456@cluster0.rx9y2bx.mongodb.net/bookstore?retryWrites=true&w=majority';
    
    console.log(`Attempting to connect to MongoDB: ${mongoURI.split('@')[1]}`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000, // Increase timeout to 10 seconds
      socketTimeoutMS: 45000,  // Increase socket timeout
      serverSelectionTimeoutMS: 10000, // Increase server selection timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Please check your internet connection and ensure your IP is whitelisted in MongoDB Atlas.');
    console.error('To whitelist your IP, go to MongoDB Atlas > Network Access > Add IP Address.');
    console.error('For development, you can temporarily allow access from anywhere with 0.0.0.0/0');
    
    // Don't exit the process in development mode to allow the app to work without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Running in development mode without database connection. Some features will not work.');
      return null;
    }
  }
};

module.exports = connectDB; 