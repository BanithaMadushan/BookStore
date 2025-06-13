const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    shippingAddress,
    paymentMethod,
    taxAmount = 0,
    shippingAmount = 0,
  } = req.body;

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.book');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty, cannot create order',
    });
  }

  // Check if all items are in stock
  for (const item of cart.items) {
    const book = item.book;
    if (book.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `${book.title} is not available in the requested quantity. Available stock: ${book.stock}`,
      });
    }
  }

  // Create order items
  const orderItems = cart.items.map((item) => {
    return {
      book: item.book._id,
      title: item.book.title,
      quantity: item.quantity,
      price: item.price,
    };
  });

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    totalAmount: cart.totalAmount,
    currencyCode: cart.currencyCode || 'USD',
    taxAmount,
    shippingAmount,
  });

  // Update book stock
  const bulkOps = cart.items.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.book._id },
        update: { $inc: { stock: -item.quantity } },
      },
    };
  });

  await Book.bulkWrite(bulkOps);

  // Clear the cart
  cart.items = [];
  await cart.save();

  // Return the order
  res.status(201).json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Get all orders for the current user
 * @route   GET /api/orders
 * @access  Private
 */
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Make sure the user is the owner of the order
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this order',
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Make sure the user is the owner of the order or an admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this order',
    });
  }

  // Update order
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    updateTime: req.body.updateTime,
    emailAddress: req.body.emailAddress,
  };

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    data: updatedOrder,
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Update status
  order.status = req.body.status;

  // If status is delivered, update delivered status
  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  // If status is cancelled, restore stock
  if (req.body.status === 'cancelled' && !order.isDelivered) {
    // Update book stock (add quantities back)
    const bulkOps = order.items.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.book },
          update: { $inc: { stock: item.quantity } },
        },
      };
    });

    await Book.bulkWrite(bulkOps);
  }

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    data: updatedOrder,
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders/admin
 * @access  Private/Admin
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  // Copy req.query to avoid modifying the original
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string and replace operators with MongoDB operators
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resources
  let query = Order.find(JSON.parse(queryStr));

  // Select specific fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort by field(s)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Order.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const orders = await query.populate('user', 'name email');

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination,
    totalPages: Math.ceil(total / limit),
    data: orders,
  });
}); 