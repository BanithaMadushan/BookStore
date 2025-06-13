const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://banithamadu12:banitha123456@cluster0.rx9y2bx.mongodb.net/bookstore?retryWrites=true&w=majority';

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
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create Book model
const Book = mongoose.model('Book', BookSchema);

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
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

// Fetch books from Google Books API
const fetchBooks = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}`);
    
    if (!response.data.items || response.data.items.length === 0) {
      console.log('No books found');
      return [];
    }
    
    return response.data.items;
  } catch (error) {
    console.error('Error fetching books from Google Books API:', error.message);
    return [];
  }
};

// Format book data from Google Books API
const formatBookData = (bookItem) => {
  const volumeInfo = bookItem.volumeInfo || {};
  
  return {
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || ['Unknown Author'],
    description: volumeInfo.description || 'No description available',
    googleBooksId: bookItem.id,
    categories: volumeInfo.categories || ['Uncategorized'],
    publisher: volumeInfo.publisher || 'Unknown Publisher',
    publishedDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : null,
    pageCount: volumeInfo.pageCount || 0,
    imageLinks: {
      thumbnail: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Image',
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
    featured: false,
  };
};

// Import books to database
const importBooks = async (query, maxResults) => {
  try {
    // Connect to database
    await connectDB();
    
    console.log(`Fetching books for query: "${query}"...`);
    
    // Fetch books from Google Books API
    const books = await fetchBooks(query, maxResults);
    
    if (books.length === 0) {
      console.log('No books found to import');
      return;
    }
    
    console.log(`Found ${books.length} books. Importing to database...`);
    
    let importedCount = 0;
    let duplicateCount = 0;
    
    // Import each book
    for (const bookItem of books) {
      const bookData = formatBookData(bookItem);
      
      // Check if book already exists
      const existingBook = await Book.findOne({ googleBooksId: bookData.googleBooksId });
      
      if (existingBook) {
        console.log(`Book already exists: ${bookData.title}`);
        duplicateCount++;
        continue;
      }
      
      // Create new book
      const book = new Book(bookData);
      
      // Save to database
      await book.save();
      
      console.log(`Imported: ${bookData.title} by ${bookData.authors.join(', ')}`);
      importedCount++;
    }
    
    console.log(`Import complete: ${importedCount} books imported, ${duplicateCount} duplicates skipped`);
    
  } catch (error) {
    console.error('Error importing books:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Import books for various categories
const importMultipleCategories = async () => {
  const categories = [
    { query: 'fiction bestsellers', count: 5 },
    { query: 'fantasy novels', count: 5 },
    { query: 'science fiction', count: 5 },
    { query: 'romance novels', count: 5 },
    { query: 'mystery thriller', count: 5 },
    { query: 'biography', count: 5 },
    { query: 'programming', count: 5 },
    { query: 'business', count: 5 }
  ];
  
  for (const category of categories) {
    console.log(`\n--- Importing ${category.query} ---`);
    await importBooks(category.query, category.count);
  }
  
  console.log('\nAll categories imported successfully!');
};

// Run the import
importMultipleCategories(); 