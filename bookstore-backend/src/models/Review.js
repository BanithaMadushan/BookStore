const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a review title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per book
ReviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Static method to calculate average rating for a book
ReviewSchema.statics.calculateAverageRating = async function (bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Book').findByIdAndUpdate(bookId, {
        'rating.average': stats[0].averageRating,
        'rating.count': stats[0].numberOfReviews,
      });
    } else {
      await mongoose.model('Book').findByIdAndUpdate(bookId, {
        'rating.average': 0,
        'rating.count': 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call calculateAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.book);
});

// Call calculateAverageRating after remove
ReviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.book);
});

module.exports = mongoose.model('Review', ReviewSchema); 