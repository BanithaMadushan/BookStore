const express = require('express');
const { check } = require('express-validator');
const {
  getBookReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Get all reviews for a book
router.get('/', getBookReviews);

// Get single review
router.get('/:id', getReview);

// Create review - need to be logged in
router.post(
  '/',
  [
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('title', 'Title is required').not().isEmpty(),
    check('comment', 'Comment is required').not().isEmpty(),
  ],
  protect,
  createReview
);

// Update review - need to be logged in and be the review owner
router.put(
  '/:id',
  [
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('title', 'Title is required').optional().not().isEmpty(),
    check('comment', 'Comment is required').optional().not().isEmpty(),
  ],
  protect,
  updateReview
);

// Delete review - need to be logged in and be the review owner
router.delete('/:id', protect, deleteReview);

module.exports = router; 