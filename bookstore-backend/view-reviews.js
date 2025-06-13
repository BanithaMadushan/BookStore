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
const User = mongoose.model('User', { name: String, email: String });
const Book = mongoose.model('Book', { title: String, authors: [String] });

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

// Get all reviews function
const getAllReviews = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all reviews with user and book details
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('book', 'title authors')
      .sort({ createdAt: -1 });
    
    if (reviews.length === 0) {
      console.log('No reviews found in the database');
      return;
    }
    
    console.log(`Found ${reviews.length} reviews in the database:`);
    console.log('---------------------------------------------');
    
    // Display each review
    reviews.forEach((review, index) => {
      console.log(`Review #${index + 1}`);
      console.log(`ID: ${review._id}`);
      console.log(`Book: ${review.book ? review.book.title : 'Unknown Book'} by ${review.book && review.book.authors ? review.book.authors.join(', ') : 'Unknown Authors'}`);
      console.log(`User: ${review.user ? review.user.name : 'Unknown'} (${review.user ? review.user.email : 'Unknown'})`);
      console.log(`Rating: ${review.rating} / 5`);
      console.log(`Title: ${review.title}`);
      console.log(`Comment: ${review.comment}`);
      console.log(`Date: ${review.createdAt}`);
      console.log('---------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error getting reviews:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Get reviews for a specific book
const getBookReviews = async (bookId) => {
  try {
    // Connect to database
    await connectDB();
    
    // Get book info
    const book = await Book.findById(bookId);
    if (!book) {
      console.log(`No book found with ID: ${bookId}`);
      return;
    }
    
    // Get reviews for the book
    const reviews = await Review.find({ book: bookId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Book: ${book.title} by ${book.authors ? book.authors.join(', ') : 'Unknown'}`);
    
    if (reviews.length === 0) {
      console.log('No reviews found for this book');
      return;
    }
    
    console.log(`Found ${reviews.length} reviews:`);
    console.log('---------------------------------------------');
    
    // Display each review
    reviews.forEach((review, index) => {
      console.log(`Review #${index + 1}`);
      console.log(`User: ${review.user ? review.user.name : 'Unknown'} (${review.user ? review.user.email : 'Unknown'})`);
      console.log(`Rating: ${review.rating} / 5`);
      console.log(`Title: ${review.title}`);
      console.log(`Comment: ${review.comment}`);
      console.log(`Date: ${review.createdAt}`);
      console.log('---------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error getting book reviews:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run based on command line arguments
const bookId = process.argv[2];

if (bookId) {
  getBookReviews(bookId);
} else {
  getAllReviews();
} 