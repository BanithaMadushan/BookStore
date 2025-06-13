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
const User = mongoose.model('User', { name: String, email: String });

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

// Get all orders function
const getAllOrders = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all orders with user info
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      console.log('No orders found in the database');
      return;
    }
    
    console.log(`Found ${orders.length} orders in the database:`);
    console.log('---------------------------------------------');
    
    // Display each order
    orders.forEach((order, index) => {
      console.log(`Order #${index + 1}`);
      console.log(`ID: ${order._id}`);
      console.log(`User: ${order.user ? order.user.name : 'Unknown'} (${order.user ? order.user.email : 'Unknown'})`);
      console.log(`Date: ${order.createdAt}`);
      console.log(`Total: $${order.totalPrice.toFixed(2)}`);
      console.log(`Paid: ${order.isPaid ? 'Yes' : 'No'}${order.paidAt ? ` on ${order.paidAt}` : ''}`);
      console.log(`Delivered: ${order.isDelivered ? 'Yes' : 'No'}${order.deliveredAt ? ` on ${order.deliveredAt}` : ''}`);
      
      console.log('Items:');
      order.orderItems.forEach(item => {
        console.log(`  - ${item.title} (${item.qty}) at $${item.price.toFixed(2)} each`);
      });
      
      console.log('Shipping:');
      console.log(`  ${order.shippingAddress.address}`);
      console.log(`  ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
      console.log(`  ${order.shippingAddress.country}`);
      console.log('---------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error getting orders:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run script
getAllOrders(); 