const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Order model schema
const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        title: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        book: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Book',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'PayPal',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create Order model
const Order = mongoose.model('Order', OrderSchema);

// User and Book models
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const BookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  price: Object,
  imageLinks: {
    thumbnail: String
  }
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

// Add sample order function
const addSampleOrder = async (userId, bookItems, shippingAddress, paymentMethod, isPaid, isDelivered) => {
  try {
    // Connect to database
    await connectDB();
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }
    
    // Process order items
    const orderItems = [];
    let itemsPrice = 0;
    
    for (const item of bookItems) {
      // Verify book exists
      const book = await Book.findById(item.bookId);
      if (!book) {
        console.error(`Book with ID ${item.bookId} not found`);
        continue;
      }
      
      const price = book.price.amount || 0;
      itemsPrice += price * item.quantity;
      
      orderItems.push({
        title: book.title,
        qty: item.quantity,
        image: book.imageLinks.thumbnail || 'https://via.placeholder.com/128x192?text=No+Image',
        price: price,
        book: item.bookId
      });
    }
    
    // Calculate prices
    const taxPrice = parseFloat((itemsPrice * 0.15).toFixed(2));
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));
    
    // Create payment result if paid
    let paymentResult = null;
    if (isPaid) {
      paymentResult = {
        id: 'SAMPLE_PAYMENT_' + Date.now(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: user.email
      };
    }
    
    // Create new order
    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: isPaid ? new Date() : null,
      isDelivered,
      deliveredAt: isDelivered ? new Date() : null
    });
    
    // Save to database
    await order.save();
    
    console.log(`Order created for user "${user.name}"`);
    console.log(`Order ID: ${order._id}`);
    console.log(`Total: $${totalPrice.toFixed(2)} (Items: $${itemsPrice.toFixed(2)}, Tax: $${taxPrice.toFixed(2)}, Shipping: $${shippingPrice.toFixed(2)})`);
    console.log(`Payment Method: ${paymentMethod}`);
    console.log(`Paid: ${isPaid ? 'Yes' : 'No'}${isPaid ? ` on ${order.paidAt}` : ''}`);
    console.log(`Delivered: ${isDelivered ? 'Yes' : 'No'}${isDelivered ? ` on ${order.deliveredAt}` : ''}`);
    
    console.log('Items:');
    for (const item of orderItems) {
      console.log(`- ${item.title} (${item.qty}) at $${item.price.toFixed(2)} each`);
    }
    
    console.log('Shipping Address:');
    console.log(`  ${shippingAddress.address}`);
    console.log(`  ${shippingAddress.city}, ${shippingAddress.postalCode}`);
    console.log(`  ${shippingAddress.country}`);
    
  } catch (error) {
    console.error('Error adding order:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Default shipping address
const defaultShippingAddress = {
  address: '123 Main St',
  city: 'New York',
  postalCode: '10001',
  country: 'USA'
};

// Parse command line arguments
const userId = process.argv[2];
const isPaid = process.argv[3] === 'paid' ? true : false;
const isDelivered = process.argv[4] === 'delivered' ? true : false;
const paymentMethod = process.argv[5] || 'PayPal';
const bookItems = [];

// Process book items (format: bookId:quantity)
for (let i = 6; i < process.argv.length; i++) {
  const itemParts = process.argv[i].split(':');
  
  if (itemParts.length === 2) {
    bookItems.push({
      bookId: itemParts[0],
      quantity: parseInt(itemParts[1]) || 1
    });
  }
}

// Use default book items if none provided
if (bookItems.length === 0) {
  bookItems.push({
    bookId: '68190beab268fd4687288470', // The Fellowship of the Ring
    quantity: 1
  });
  
  bookItems.push({
    bookId: '68190bf8e50c6bf4794e7a0c', // Learning Python
    quantity: 1
  });
}

// Validate arguments
if (!userId) {
  console.log('Usage: node add-order.js <userId> [paid|unpaid] [delivered|undelivered] [paymentMethod] [bookId:quantity] ...');
  console.log('Example: node add-order.js 68190946518cbe22969e07f3 paid undelivered PayPal 68190beab268fd4687288470:2 68190bf8e50c6bf4794e7a0c:1');
  process.exit(1);
}

// Add the order
addSampleOrder(userId, bookItems, defaultShippingAddress, paymentMethod, isPaid, isDelivered); 