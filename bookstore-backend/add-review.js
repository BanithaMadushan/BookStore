const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Review model schema
const ReviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Book',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Review model
const Review = mongoose.model('Review', ReviewSchema);

// User and Book models
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const BookSchema = new mongoose.Schema({
  title: String,
  authors: [String]
});

const User = mongoose.model('User', UserSchema);
const Book = mongoose.model('Book', BookSchema);

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

// Add sample review function
const addSampleReview = async (bookId, userId, rating, title, comment) => {
  try {
    // Connect to database
    await connectDB();
    
    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      console.error(`Book with ID ${bookId} not found`);
      return;
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }
    
    // Create new review
    const review = new Review({
      book: bookId,
      user: userId,
      rating,
      title,
      comment,
    });
    
    // Save to database
    await review.save();
    
    console.log(`Review added for book "${book.title}" by user "${user.name}"`);
    console.log(`Rating: ${rating}/5`);
    console.log(`Title: "${title}"`);
    console.log(`Comment: "${comment}"`);
    
  } catch (error) {
    console.error('Error adding review:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Parse command line arguments
const bookId = process.argv[2];
const userId = process.argv[3];
const rating = parseInt(process.argv[4]) || 5;
const title = process.argv[5] || 'Great book!';
const comment = process.argv[6] || 'I really enjoyed reading this book. Highly recommended!';

// Validate arguments
if (!bookId || !userId) {
  console.log('Usage: node add-review.js <bookId> <userId> [rating] [title] [comment]');
  process.exit(1);
}

// Add the review
addSampleReview(bookId, userId, rating, title, comment); 