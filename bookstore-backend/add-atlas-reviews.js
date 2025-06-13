const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://banithamadu12:banitha123456@cluster0.rx9y2bx.mongodb.net/bookstore?retryWrites=true&w=majority';

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

// Create models
const Review = mongoose.model('Review', ReviewSchema);
const User = mongoose.model('User', { name: String, email: String });
const Book = mongoose.model('Book', { title: String, authors: [String] });

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

// Add sample reviews
const addSampleReviews = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get users
    const users = await User.find({});
    if (users.length === 0) {
      console.error('No users found in database. Please add users first.');
      return;
    }
    
    // Get books
    const books = await Book.find({}).limit(20);
    if (books.length === 0) {
      console.error('No books found in database. Please add books first.');
      return;
    }
    
    console.log(`Found ${users.length} users and ${books.length} books`);
    console.log('Adding sample reviews to database...');
    
    // Sample reviews
    const sampleReviews = [
      {
        rating: 5,
        title: 'Amazing book!',
        comment: 'One of the best books I have ever read. Highly recommended!'
      },
      {
        rating: 4,
        title: 'Great read',
        comment: 'I really enjoyed this book. The characters are well-developed and the plot is engaging.'
      },
      {
        rating: 3,
        title: 'Decent',
        comment: 'This book was okay. Not great, not terrible. Worth reading if you have the time.'
      },
      {
        rating: 5,
        title: 'Masterpiece',
        comment: 'A true masterpiece of literature. The author\'s writing style is captivating.'
      },
      {
        rating: 4,
        title: 'Very good',
        comment: 'Very enjoyable read. I would recommend it to friends.'
      }
    ];
    
    // Add reviews (one per book for first 10 books)
    let addedCount = 0;
    
    for (let i = 0; i < 10; i++) {
      const book = books[i];
      const user = users[Math.floor(Math.random() * users.length)]; // Random user
      const reviewTemplate = sampleReviews[Math.floor(Math.random() * sampleReviews.length)]; // Random review template
      
      // Create review
      const review = new Review({
        book: book._id,
        user: user._id,
        rating: reviewTemplate.rating,
        title: reviewTemplate.title,
        comment: reviewTemplate.comment
      });
      
      // Save to database
      await review.save();
      
      console.log(`Added review for "${book.title}" by user ${user.name}: ${reviewTemplate.rating} stars`);
      addedCount++;
    }
    
    console.log(`Added ${addedCount} sample reviews successfully!`);
    
  } catch (error) {
    console.error('Error adding sample reviews:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the function
addSampleReviews(); 