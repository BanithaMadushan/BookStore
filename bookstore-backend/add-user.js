const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// User model schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create User model
const User = mongoose.model('User', UserSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Add sample user function
const addSampleUser = async (name, email, password, role) => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists. User ID: ${existingUser._id}`);
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    
    // Save to database
    await user.save();
    
    console.log(`User created: ${name} (${email})`);
    console.log(`Role: ${role}`);
    console.log(`User ID: ${user._id}`);
    
  } catch (error) {
    console.error('Error adding user:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Parse command line arguments
const name = process.argv[2] || 'Sample User';
const email = process.argv[3] || 'sample@example.com';
const password = process.argv[4] || 'password123';
const role = (process.argv[5] === 'admin') ? 'admin' : 'user';

// Add the user
addSampleUser(name, email, password, role); 