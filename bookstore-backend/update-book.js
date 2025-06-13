const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Define Book model schema
const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authors: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    googleBooksId: {
      type: String,
      unique: true,
      sparse: true,
    },
    categories: {
      type: [String],
      default: ['Uncategorized'],
    },
    publisher: {
      type: String,
      default: 'Unknown Publisher',
    },
    publishedDate: {
      type: Date,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    imageLinks: {
      thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/128x192?text=No+Image',
      },
    },
    language: {
      type: String,
      default: 'en',
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
        default: 9.99,
      },
      currencyCode: {
        type: String,
        default: 'USD',
      },
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    stock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Create Book model
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

// Update book price
const updateBookPrice = async (bookId, newPrice) => {
  try {
    // Connect to database
    await connectDB();
    
    // Find book by ID
    const book = await Book.findById(bookId);
    
    if (!book) {
      console.log(`No book found with ID ${bookId}`);
      return;
    }
    
    // Update price
    book.price.amount = parseFloat(newPrice);
    await book.save();
    
    console.log(`Updated price for book "${book.title}" to ${newPrice} ${book.price.currencyCode}`);
    
  } catch (error) {
    console.error('Error updating book price:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Update book stock
const updateBookStock = async (bookId, newStock) => {
  try {
    // Connect to database
    await connectDB();
    
    // Find book by ID
    const book = await Book.findById(bookId);
    
    if (!book) {
      console.log(`No book found with ID ${bookId}`);
      return;
    }
    
    // Update stock
    book.stock = parseInt(newStock);
    await book.save();
    
    console.log(`Updated stock for book "${book.title}" to ${newStock}`);
    
  } catch (error) {
    console.error('Error updating book stock:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Set featured status
const setFeaturedStatus = async (bookId, isFeatured) => {
  try {
    // Connect to database
    await connectDB();
    
    // Find book by ID
    const book = await Book.findById(bookId);
    
    if (!book) {
      console.log(`No book found with ID ${bookId}`);
      return;
    }
    
    // Update featured status
    book.featured = isFeatured === 'true';
    await book.save();
    
    console.log(`Set featured status for book "${book.title}" to ${isFeatured}`);
    
  } catch (error) {
    console.error('Error updating featured status:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Display usage help
const displayHelp = () => {
  console.log('Usage:');
  console.log('  node update-book.js price <bookId> <newPrice>');
  console.log('  node update-book.js stock <bookId> <newStock>');
  console.log('  node update-book.js feature <bookId> <true/false>');
};

// Run based on command line arguments
const action = process.argv[2];
const bookId = process.argv[3];
const value = process.argv[4];

if (!action || !bookId) {
  displayHelp();
  process.exit(1);
}

switch (action) {
  case 'price':
    if (!value || isNaN(parseFloat(value))) {
      console.log('Please provide a valid price');
      process.exit(1);
    }
    updateBookPrice(bookId, value);
    break;
  case 'stock':
    if (!value || isNaN(parseInt(value))) {
      console.log('Please provide a valid stock quantity');
      process.exit(1);
    }
    updateBookStock(bookId, value);
    break;
  case 'feature':
    if (value !== 'true' && value !== 'false') {
      console.log('Please provide true or false for featured status');
      process.exit(1);
    }
    setFeaturedStatus(bookId, value);
    break;
  default:
    console.log(`Invalid action: ${action}`);
    displayHelp();
    process.exit(1);
} 