const express = require('express');
const { check } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All cart routes need authentication
router.use(protect);

// Get cart
router.get('/', getCart);

// Add to cart
router.post(
  '/',
  [
    check('bookId', 'Book ID is required').not().isEmpty(),
    check('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
  ],
  addToCart
);

// Update cart item
router.put(
  '/:itemId',
  [check('quantity', 'Quantity must be at least 1').isInt({ min: 1 })],
  updateCartItem
);

// Remove item from cart
router.delete('/:itemId', removeCartItem);

// Clear cart
router.delete('/', clearCart);

module.exports = router; 