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

// User and Book models
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const BookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  price: Object
});

const User = mongoose.model('User', UserSchema);
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

// Add sample cart function
const addSampleCart = async (userId, bookItems) => {
  try {
    // Connect to database
    await connectDB();
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }
    
    // Check if user already has a cart
    let cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      console.log(`User ${user.name} already has a cart. Updating it...`);
      
      // Update existing cart
      for (const item of bookItems) {
        // Verify book exists
        const book = await Book.findById(item.bookId);
        if (!book) {
          console.error(`Book with ID ${item.bookId} not found`);
          continue;
        }
        
        // Check if book already in cart
        const existingItem = cart.items.find(cartItem => 
          cartItem.book.toString() === item.bookId
        );
        
        if (existingItem) {
          // Update quantity
          existingItem.quantity = item.quantity;
        } else {
          // Add new item
          cart.items.push({
            book: item.bookId,
            quantity: item.quantity
          });
        }
      }
    } else {
      // Create new cart
      const cartItems = [];
      
      for (const item of bookItems) {
        // Verify book exists
        const book = await Book.findById(item.bookId);
        if (!book) {
          console.error(`Book with ID ${item.bookId} not found`);
          continue;
        }
        
        cartItems.push({
          book: item.bookId,
          quantity: item.quantity
        });
      }
      
      cart = new Cart({
        user: userId,
        items: cartItems
      });
    }
    
    // Save to database
    await cart.save();
    
    // Get full cart details
    const populatedCart = await Cart.findById(cart._id)
      .populate('user', 'name email')
      .populate('items.book', 'title price');
    
    console.log(`Cart created/updated for user "${user.name}"`);
    console.log('Items:');
    
    let totalValue = 0;
    
    for (const item of populatedCart.items) {
      const bookPrice = item.book.price.amount || 0;
      const itemTotal = bookPrice * item.quantity;
      totalValue += itemTotal;
      
      console.log(`- ${item.book.title}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: $${bookPrice.toFixed(2)} each ($${itemTotal.toFixed(2)} total)`);
    }
    
    console.log(`Total Cart Value: $${totalValue.toFixed(2)}`);
    
  } catch (error) {
    console.error('Error adding cart:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Parse command line arguments
const userId = process.argv[2];
const bookItems = [];

// Process book items (format: bookId:quantity)
for (let i = 3; i < process.argv.length; i++) {
  const itemParts = process.argv[i].split(':');
  
  if (itemParts.length === 2) {
    bookItems.push({
      bookId: itemParts[0],
      quantity: parseInt(itemParts[1]) || 1
    });
  }
}

// Validate arguments
if (!userId || bookItems.length === 0) {
  console.log('Usage: node add-cart.js <userId> <bookId:quantity> [bookId:quantity] ...');
  console.log('Example: node add-cart.js 68190946518cbe22969e07f3 68190beab268fd4687288470:2 68190bf8e50c6bf4794e7a0c:1');
  process.exit(1);
}

// Add the cart
addSampleCart(userId, bookItems); 