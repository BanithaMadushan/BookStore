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

// Search books by title
const searchBooksByTitle = async (query) => {
  try {
    await connectDB();
    
    const books = await Book.find({ 
      title: { $regex: query, $options: 'i' } 
    }).sort({ title: 1 });
    
    displayBooks(books, `title matching "${query}"`);
  } catch (error) {
    console.error('Error searching books by title:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Search books by author
const searchBooksByAuthor = async (query) => {
  try {
    await connectDB();
    
    const books = await Book.find({ 
      authors: { $regex: query, $options: 'i' } 
    }).sort({ title: 1 });
    
    displayBooks(books, `author matching "${query}"`);
  } catch (error) {
    console.error('Error searching books by author:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Search books by category
const searchBooksByCategory = async (query) => {
  try {
    await connectDB();
    
    const books = await Book.find({ 
      categories: { $regex: query, $options: 'i' } 
    }).sort({ title: 1 });
    
    displayBooks(books, `category matching "${query}"`);
  } catch (error) {
    console.error('Error searching books by category:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Display books helper function
const displayBooks = (books, searchType) => {
  if (books.length === 0) {
    console.log(`No books found with ${searchType}`);
    return;
  }
  
  console.log(`Found ${books.length} books with ${searchType}:`);
  console.log('---------------------------------------------');
  
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
};

// List all categories
const listAllCategories = async () => {
  try {
    await connectDB();
    
    // Get distinct categories
    const categories = await Book.distinct('categories');
    
    if (categories.length === 0) {
      console.log('No categories found in the database');
      return;
    }
    
    console.log(`Found ${categories.length} different categories in the database:`);
    console.log('---------------------------------------------');
    
    // Sort alphabetically
    categories.sort();
    
    // Display categories
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });
    
  } catch (error) {
    console.error('Error listing categories:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Parse command line arguments
const action = process.argv[2];
const query = process.argv[3];

if (!action) {
  console.log('Please provide an action: title, author, category, or list-categories');
  process.exit(1);
}

switch (action) {
  case 'title':
    if (!query) {
      console.log('Please provide a title search query');
      process.exit(1);
    }
    searchBooksByTitle(query);
    break;
  case 'author':
    if (!query) {
      console.log('Please provide an author search query');
      process.exit(1);
    }
    searchBooksByAuthor(query);
    break;
  case 'category':
    if (!query) {
      console.log('Please provide a category search query');
      process.exit(1);
    }
    searchBooksByCategory(query);
    break;
  case 'list-categories':
    listAllCategories();
    break;
  default:
    console.log('Invalid action. Use "title", "author", "category", or "list-categories"');
    process.exit(1);
} 