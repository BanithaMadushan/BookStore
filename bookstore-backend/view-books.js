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

// Get all books function
const getAllBooks = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all books
    const books = await Book.find({}).sort({ title: 1 });
    
    if (books.length === 0) {
      console.log('No books found in the database');
      return;
    }
    
    console.log(`Found ${books.length} books in the database:`);
    console.log('---------------------------------------------');
    
    // Display each book
    books.forEach((book, index) => {
      console.log(`Book #${index + 1}`);
      console.log(`ID: ${book._id}`);
      console.log(`Title: ${book.title}`);
      console.log(`Authors: ${book.authors.join(', ')}`);
      console.log(`Categories: ${book.categories.join(', ')}`);
      console.log(`Price: ${book.price.amount} ${book.price.currencyCode}`);
      console.log(`Rating: ${book.rating.average} (${book.rating.count} ratings)`);
      console.log(`Stock: ${book.stock}`);
      console.log(`Image: ${book.imageLinks.thumbnail}`);
      console.log('---------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error getting books:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Search for books by title
const searchBooksByTitle = async (query) => {
  try {
    // Connect to database
    await connectDB();
    
    // Search for books
    const books = await Book.find({ 
      title: { $regex: query, $options: 'i' } 
    }).sort({ title: 1 });
    
    if (books.length === 0) {
      console.log(`No books found matching "${query}"`);
      return;
    }
    
    console.log(`Found ${books.length} books matching "${query}":`);
    console.log('---------------------------------------------');
    
    // Display each book
    books.forEach((book, index) => {
      console.log(`Book #${index + 1}`);
      console.log(`ID: ${book._id}`);
      console.log(`Title: ${book.title}`);
      console.log(`Authors: ${book.authors.join(', ')}`);
      console.log(`Categories: ${book.categories.join(', ')}`);
      console.log(`Price: ${book.price.amount} ${book.price.currencyCode}`);
      console.log(`Rating: ${book.rating.average} (${book.rating.count} ratings)`);
      console.log(`Stock: ${book.stock}`);
      console.log(`Image: ${book.imageLinks.thumbnail}`);
      console.log('---------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error searching books:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run based on command line arguments
const action = process.argv[2] || 'all';
const query = process.argv[3] || '';

if (action === 'all') {
  getAllBooks();
} else if (action === 'search') {
  if (!query) {
    console.log('Please provide a search query');
    process.exit(1);
  }
  searchBooksByTitle(query);
} else {
  console.log('Invalid action. Use "all" or "search"');
  process.exit(1);
} 