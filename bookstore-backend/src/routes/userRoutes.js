const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Define user routes here
// For now, just create a simple route
router.get('/', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User routes are working'
  });
});

module.exports = router; 