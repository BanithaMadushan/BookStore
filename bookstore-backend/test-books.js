const axios = require('axios');
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
      required: [true, 'Please provide a book title'],
      trim: true,
      maxlength: [200, 'Book title cannot be more than 200 characters'],
    },
    authors: {
      type: [String],
      required: [true, 'Please provide at least one author'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
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
        required: [true, 'Please provide a price'],
        min: [0, 'Price must be greater than 0'],
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
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot be more than 5'],
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

// Search for books in Google Books API
const searchBooks = async (query, maxResults = 5) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes`,
      {
        params: {
          q: query,
          maxResults,
        },
      }
    );

    if (!response.data.items) {
      console.log('No books found');
      return [];
    }

    return response.data.items.map((item) => {
      const volumeInfo = item.volumeInfo;
      const saleInfo = item.saleInfo || {};
      
      return {
        googleBooksId: item.id,
        title: volumeInfo.title || 'Unknown Title',
        authors: volumeInfo.authors || ['Unknown Author'],
        publisher: volumeInfo.publisher || 'Unknown Publisher',
        publishedDate: volumeInfo.publishedDate || null,
        description: volumeInfo.description || 'No description available',
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories || ['Uncategorized'],
        imageLinks: volumeInfo.imageLinks || {
          thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
        },
        language: volumeInfo.language || 'en',
        price: {
          amount: 9.99,
          currencyCode: 'USD',
        },
        rating: {
          average: volumeInfo.averageRating || 0,
          count: volumeInfo.ratingsCount || 0,
        },
        stock: 10,
      };
    });
  } catch (error) {
    console.error('Error fetching books from Google API:', error);
    return [];
  }
};

// Import books to database
const importBooks = async (query) => {
  try {
    // Connect to database
    await connectDB();
    
    // Search for books
    console.log(`Searching for books with query: ${query}`);
    const books = await searchBooks(query);
    
    if (books.length === 0) {
      console.log('No books found to import');
      return;
    }
    
    console.log(`Found ${books.length} books. Importing to database...`);
    
    // Import each book
    for (const bookData of books) {
      // Check if book already exists
      const existingBook = await Book.findOne({ googleBooksId: bookData.googleBooksId });
      
      if (existingBook) {
        console.log(`Book "${bookData.title}" already exists in database`);
        continue;
      }
      
      // Create new book
      const book = await Book.create(bookData);
      console.log(`Imported book: ${book.title}`);
    }
    
    console.log('Book import completed successfully');
  } catch (error) {
    console.error('Error importing books:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the script with command line arguments
const query = process.argv[2] || 'Harry Potter';
importBooks(query); 