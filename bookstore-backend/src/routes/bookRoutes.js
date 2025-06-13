const express = require('express');
const { check } = require('express-validator');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchGoogleBooks,
  getGoogleBookById,
  importGoogleBook
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBooks);

// Google Books API routes (these need to be before the :id route to avoid conflicts)
router.get('/google/search', searchGoogleBooks);
router.get('/google/:id', getGoogleBookById);

// Admin routes
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('authors', 'At least one author is required').isArray({ min: 1 }),
    check('description', 'Description is required').not().isEmpty(),
    check('price.amount', 'Price is required').isNumeric(),
    check('stock', 'Stock is required').isNumeric(),
  ],
  protect,
  authorize('admin'),
  createBook
);

router.post('/google/import/:id', protect, authorize('admin'), importGoogleBook);

// These routes should be after the specific routes to avoid conflicts
router.get('/:id', getBookById);
router.put('/:id', protect, authorize('admin'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router; 