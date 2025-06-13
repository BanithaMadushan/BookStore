const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Book model schema simplified for this script
const BookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  googleBooksId: String
});

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
const listAllBookIds = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all books (only the necessary fields)
    const books = await Book.find({})
      .select('_id title authors')
      .sort({ title: 1 });
    
    if (books.length === 0) {
      console.log('No books found in the database');
      return;
    }
    
    console.log(`Found ${books.length} books in the database:`);
    console.log('---------------------------------------------');
    
    // Display each book
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} by ${book.authors.join(', ')}`);
      console.log(`   ID: ${book._id}`);
    });
    
  } catch (error) {
    console.error('Error getting books:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run script
listAllBookIds(); 