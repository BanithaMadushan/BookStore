const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');
const googleBooksApi = require('../utils/googleBooksApi');

/**
 * @desc    Get all books with filtering, sorting, and pagination
 * @route   GET /api/books
 * @access  Public
 */
exports.getBooks = asyncHandler(async (req, res) => {
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
  let query = Book.find(JSON.parse(queryStr));

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
  const total = await Book.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const books = await query;

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
    count: books.length,
    pagination,
    totalPages: Math.ceil(total / limit),
    data: books,
  });
});

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
exports.getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

/**
 * @desc    Create a new book
 * @route   POST /api/books
 * @access  Private/Admin
 */
exports.createBook = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Create book
  const book = await Book.create(req.body);

  res.status(201).json({
    success: true,
    data: book,
  });
});

/**
 * @desc    Update book
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
exports.updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book not found with id of ${req.params.id}`,
    });
  }

  // Update book
  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: book,
  });
});

/**
 * @desc    Delete book
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book not found with id of ${req.params.id}`,
    });
  }

  await book.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Search books using Google Books API
 * @route   GET /api/books/google/search
 * @access  Public
 */
exports.searchGoogleBooks = asyncHandler(async (req, res) => {
  const { query, maxResults } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a search query',
    });
  }

  const books = await googleBooksApi.searchBooks(query, maxResults);

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  });
});

/**
 * @desc    Get book details from Google Books API
 * @route   GET /api/books/google/:id
 * @access  Public
 */
exports.getGoogleBookById = asyncHandler(async (req, res) => {
  const book = await googleBooksApi.getBookById(req.params.id);

  res.status(200).json({
    success: true,
    data: book,
  });
});

/**
 * @desc    Import book from Google Books API
 * @route   POST /api/books/google/import/:id
 * @access  Private/Admin
 */
exports.importGoogleBook = asyncHandler(async (req, res) => {
  const googleBookId = req.params.id;

  // Check if book already exists in our database
  const existingBook = await Book.findOne({ googleBooksId: googleBookId });
  if (existingBook) {
    return res.status(400).json({
      success: false,
      message: 'This book already exists in the database',
    });
  }

  // Get book details from Google Books API
  const bookDetails = await googleBooksApi.getBookById(googleBookId);

  // Extract relevant data for our Book model
  const bookData = {
    title: bookDetails.title,
    authors: bookDetails.authors,
    description: bookDetails.description,
    categories: bookDetails.categories,
    publisher: bookDetails.publisher,
    publishedDate: bookDetails.publishedDate,
    pageCount: bookDetails.pageCount,
    imageLinks: bookDetails.imageLinks,
    language: bookDetails.language,
    googleBooksId: googleBookId,
    price: {
      amount: bookDetails.listPrice?.amount || 9.99, // Default price if not available
      currencyCode: bookDetails.listPrice?.currencyCode || 'USD',
    },
    rating: {
      average: bookDetails.averageRating || 0,
      count: bookDetails.ratingsCount || 0,
    },
    stock: 10, // Default stock level
  };

  // Create the book in our database
  const book = await Book.create(bookData);

  res.status(201).json({
    success: true,
    data: book,
  });
}); 