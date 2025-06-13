const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get reviews for a book
 * @route   GET /api/books/:bookId/reviews
 * @access  Public
 */
exports.getBookReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  // Get reviews
  const reviews = await Review.find({ book: bookId })
    .populate('user', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

/**
 * @desc    Get a single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
exports.getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('user', 'name');

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

/**
 * @desc    Create a review
 * @route   POST /api/books/:bookId/reviews
 * @access  Private
 */
exports.createReview = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bookId } = req.params;
  const { rating, title, comment } = req.body;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }

  // Check if user already reviewed this book
  const alreadyReviewed = await Review.findOne({
    user: req.user.id,
    book: bookId,
  });

  if (alreadyReviewed) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this book',
    });
  }

  // Check if user purchased the book for verified purchase badge
  const userOrders = await Order.find({
    user: req.user.id,
    isPaid: true,
    'items.book': bookId,
  });

  const isVerifiedPurchase = userOrders.length > 0;

  // Create review
  const review = await Review.create({
    user: req.user.id,
    book: bookId,
    rating,
    title,
    comment,
    isVerifiedPurchase,
  });

  // Return the review with user details
  const populatedReview = await Review.findById(review._id).populate(
    'user',
    'name'
  );

  res.status(201).json({
    success: true,
    data: populatedReview,
  });
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
exports.updateReview = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  // Make sure review belongs to user
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review',
    });
  }

  // Update review
  review.rating = req.body.rating || review.rating;
  review.title = req.body.title || review.title;
  review.comment = req.body.comment || review.comment;

  await review.save();

  // Return the updated review with user details
  const updatedReview = await Review.findById(review._id).populate(
    'user',
    'name'
  );

  res.status(200).json({
    success: true,
    data: updatedReview,
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review',
    });
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
}); 