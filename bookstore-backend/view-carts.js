const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

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

// Create Cart model
const Cart = mongoose.model('Cart', CartSchema);
const User = mongoose.model('User', { name: String, email: String });
const Book = mongoose.model('Book', { title: String, price: Object });

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

// Get all carts function
const getAllCarts = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all carts with user and book details
    const carts = await Cart.find({})
      .populate('user', 'name email')
      .populate('items.book', 'title price')
      .sort({ createdAt: -1 });
    
    if (carts.length === 0) {
      console.log('No carts found in the database');
      return;
    }
    
    console.log(`Found ${carts.length} carts in the database:`);
    console.log('---------------------------------------------');
    
    // Display each cart
    carts.forEach((cart, index) => {
      console.log(`Cart #${index + 1}`);
      console.log(`ID: ${cart._id}`);
      console.log(`User: ${cart.user ? cart.user.name : 'Unknown'} (${cart.user ? cart.user.email : 'Unknown'})`);
      console.log(`Last Updated: ${cart.updatedAt}`);
      
      console.log('Items:');
      if (cart.items.length === 0) {
        console.log('  No items in cart');
      } else {
        let totalPrice = 0;
        cart.items.forEach(item => {
          const bookPrice = item.book?.price?.amount || 0;
          const itemTotal = bookPrice * item.quantity;
          totalPrice += itemTotal;
          
          console.log(`  - ${item.book ? item.book.title : 'Unknown Book'}`);
          console.log(`    Quantity: ${item.quantity}`);
          console.log(`    Price: $${bookPrice.toFixed(2)} each ($${itemTotal.toFixed(2)} total)`);
        });
        console.log(`Total Cart Value: $${totalPrice.toFixed(2)}`);
      }
      console.log('---------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error getting carts:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run script
getAllCarts(); 