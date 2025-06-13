const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://banithamadu12:banitha123456@cluster0.rx9y2bx.mongodb.net/bookstore?retryWrites=true&w=majority';

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

// Create models
const Order = mongoose.model('Order', OrderSchema);
const User = mongoose.model('User', { name: String, email: String });
const Book = mongoose.model('Book', { 
  title: String, 
  authors: [String], 
  price: { amount: Number, currencyCode: String },
  imageLinks: { thumbnail: String }
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

// Sample shipping addresses
const shippingAddresses = [
  {
    address: '123 Main St',
    city: 'New York',
    postalCode: '10001',
    country: 'USA'
  },
  {
    address: '456 Park Ave',
    city: 'Los Angeles',
    postalCode: '90001',
    country: 'USA'
  },
  {
    address: '789 Maple St',
    city: 'Chicago',
    postalCode: '60007',
    country: 'USA'
  },
  {
    address: '321 Oak Dr',
    city: 'Houston',
    postalCode: '77001',
    country: 'USA'
  }
];

// Payment methods
const paymentMethods = ['PayPal', 'Credit Card', 'Stripe'];

// Add sample orders
const addSampleOrders = async () => {
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
    console.log('Adding sample orders to database...');
    
    // Create orders for each user
    for (const user of users) {
      // Create 1-2 orders per user
      const numOrders = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numOrders; i++) {
        // Select 1-3 random books for this order
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let itemsPrice = 0;
        
        // Add books to order
        const selectedBookIndices = new Set();
        while (selectedBookIndices.size < numItems) {
          const randomIndex = Math.floor(Math.random() * books.length);
          selectedBookIndices.add(randomIndex);
        }
        
        for (const index of selectedBookIndices) {
          const book = books[index];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 copies
          const price = book.price?.amount || 9.99;
          
          orderItems.push({
            title: book.title,
            qty: quantity,
            image: book.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Image',
            price: price,
            book: book._id
          });
          
          itemsPrice += price * quantity;
        }
        
        // Calculate prices
        const taxPrice = parseFloat((itemsPrice * 0.15).toFixed(2));
        const shippingPrice = itemsPrice > 100 ? 0 : 10;
        const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));
        
        // Random shipping address
        const shippingAddress = shippingAddresses[Math.floor(Math.random() * shippingAddresses.length)];
        
        // Random payment method
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // Randomly decide if order is paid and delivered
        const isPaid = Math.random() > 0.3; // 70% chance of being paid
        const isDelivered = isPaid && Math.random() > 0.5; // 50% chance of being delivered if paid
        
        // Create payment result if paid
        let paymentResult = null;
        if (isPaid) {
          paymentResult = {
            id: 'SAMPLE_PAYMENT_' + Date.now() + Math.floor(Math.random() * 1000),
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: user.email
          };
        }
        
        // Create order
        const order = new Order({
          user: user._id,
          orderItems,
          shippingAddress,
          paymentMethod,
          paymentResult,
          taxPrice,
          shippingPrice,
          totalPrice,
          isPaid,
          paidAt: isPaid ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) : null, // Random date in last week
          isDelivered,
          deliveredAt: isDelivered ? new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) : null // Random date in last 3 days
        });
        
        // Save to database
        await order.save();
        
        console.log(`Order created for ${user.name}: $${totalPrice.toFixed(2)} - Paid: ${isPaid ? 'Yes' : 'No'}, Delivered: ${isDelivered ? 'Yes' : 'No'}`);
        console.log(`Items: ${orderItems.map(item => `${item.title} (${item.qty})`).join(', ')}`);
      }
    }
    
    console.log('Sample orders added successfully!');
    
  } catch (error) {
    console.error('Error adding sample orders:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the function
addSampleOrders(); 