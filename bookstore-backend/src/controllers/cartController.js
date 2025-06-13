const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res) => {
  // Find cart by user ID
  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.book',
    select: 'title authors imageLinks price stock',
  });

  // Create a new cart if none exists
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
exports.addToCart = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bookId, quantity } = req.body;

  // Find the book
  const book = await Book.findById(bookId);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  // Check if book is in stock
  if (book.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Book is not available in the requested quantity. Available stock: ${book.stock}`,
    });
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  // Check if book is already in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.book.toString() === bookId
  );

  if (itemIndex > -1) {
    // Update existing item
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      book: bookId,
      quantity,
      price: book.price,
    });
  }

  // Save cart
  await cart.save();

  // Return populated cart
  cart = await Cart.findById(cart._id).populate({
    path: 'items.book',
    select: 'title authors imageLinks price stock',
  });

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { quantity } = req.body;
  const { itemId } = req.params;

  // Find cart
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }

  // Find cart item
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found',
    });
  }

  // Get book to check stock
  const book = await Book.findById(cart.items[itemIndex].book);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  // Check if book is in stock
  if (book.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Book is not available in the requested quantity. Available stock: ${book.stock}`,
    });
  }

  // Update item quantity
  cart.items[itemIndex].quantity = quantity;

  // Save cart
  await cart.save();

  // Return populated cart
  cart = await Cart.findById(cart._id).populate({
    path: 'items.book',
    select: 'title authors imageLinks price stock',
  });

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
exports.removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  // Find cart
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }

  // Find cart item
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found',
    });
  }

  // Remove item from cart
  cart.items.splice(itemIndex, 1);

  // Save cart
  await cart.save();

  // Return populated cart
  cart = await Cart.findById(cart._id).populate({
    path: 'items.book',
    select: 'title authors imageLinks price stock',
  });

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res) => {
  // Find cart
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }

  // Clear items
  cart.items = [];

  // Save cart
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
}); 