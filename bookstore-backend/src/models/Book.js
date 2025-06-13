const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
      maxlength: [200, 'Book title cannot be more than 200 characters'],
    },
    authors: {
      type: [String],
      required: [true, 'Please provide at least one author'],
      validate: {
        validator: function (array) {
          return array.length > 0;
        },
        message: 'Please provide at least one author',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      match: [
        /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
        'Please provide a valid ISBN number',
      ],
    },
    googleBooksId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
    },
    categories: {
      type: [String],
      default: ['Uncategorized'],
    },
    publisher: {
      type: String,
      default: 'Unknown Publisher',
    },
    publishedDate: {
      type: Date,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    imageLinks: {
      thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/128x192?text=No+Image',
      },
      small: String,
      medium: String,
      large: String,
      extraLarge: String,
    },
    language: {
      type: String,
      default: 'en',
    },
    price: {
      amount: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price must be greater than 0'],
      },
      currencyCode: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'],
      },
    },
    rating: {
      average: {
        type: Number,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isForSale: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for text search
BookSchema.index({
  title: 'text',
  description: 'text',
  authors: 'text',
  categories: 'text',
});

// Virtual for checking if the book is in stock
BookSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Pre-save hook to set default imageLinks
BookSchema.pre('save', function (next) {
  if (!this.imageLinks || !this.imageLinks.thumbnail) {
    this.imageLinks = {
      thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
    };
  }
  next();
});

module.exports = mongoose.model('Book', BookSchema); 