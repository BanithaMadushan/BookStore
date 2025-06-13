const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://banithamadu12:banitha123456@cluster0.rx9y2bx.mongodb.net/bookstore?retryWrites=true&w=majority';

// Cart model schema
const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Book',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create models
const Cart = mongoose.model('Cart', CartSchema);
const User = mongoose.model('User', { name: String, email: String });
const Book = mongoose.model('Book', { 
  title: String, 
  authors: [String], 
  price: { amount: Number, currencyCode: String }
});

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

// Add sample carts
const addSampleCarts = async () => {
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
    const books = await Book.find({});
    if (books.length === 0) {
      console.error('No books found in database. Please add books first.');
      return;
    }
    
    console.log(`Found ${users.length} users and ${books.length} books`);
    console.log('Adding sample carts to database...');
    
    // Create a cart for each user
    for (const user of users) {
      // First check if user already has a cart
      let cart = await Cart.findOne({ user: user._id });
      let action = 'created';
      
      if (cart) {
        // Clear existing items
        cart.items = [];
        action = 'updated';
      } else {
        // Create new cart
        cart = new Cart({
          user: user._id,
          items: []
        });
      }
      
      // Add 1-3 random books to cart
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedBookIndices = new Set();
      
      while (selectedBookIndices.size < numItems) {
        const randomIndex = Math.floor(Math.random() * books.length);
        selectedBookIndices.add(randomIndex);
      }
      
      for (const index of selectedBookIndices) {
        const book = books[index];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 copies
        
        cart.items.push({
          book: book._id,
          quantity
        });
      }
      
      // Save to database
      await cart.save();
      
      // Get cart with populated book data for display
      const populatedCart = await Cart.findById(cart._id)
        .populate('user', 'name email')
        .populate('items.book', 'title price');
      
      console.log(`Cart ${action} for ${user.name}`);
      console.log('Items:');
      
      let totalValue = 0;
      
      for (const item of populatedCart.items) {
        const bookPrice = item.book.price?.amount || 9.99;
        const itemTotal = bookPrice * item.quantity;
        totalValue += itemTotal;
        
        console.log(`- ${item.book.title} (Quantity: ${item.quantity}, Price: $${bookPrice.toFixed(2)} each, Total: $${itemTotal.toFixed(2)})`);
      }
      
      console.log(`Total Cart Value: $${totalValue.toFixed(2)}`);
      console.log('---------------------------------------------');
    }
    
    console.log('Sample carts added successfully!');
    
  } catch (error) {
    console.error('Error adding sample carts:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the function
addSampleCarts(); 