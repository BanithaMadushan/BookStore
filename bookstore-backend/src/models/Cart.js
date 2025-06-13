const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currencyCode: {
      type: String,
      required: true,
      default: 'USD',
    },
  },
});

// Virtual for item total price
CartItemSchema.virtual('totalPrice').get(function () {
  return this.quantity * this.price.amount;
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    currencyCode: {
      type: String,
      default: 'USD',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total amount before saving
CartSchema.pre('save', async function (next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price.amount * item.quantity);
  }, 0);
  
  next();
});

module.exports = mongoose.model('Cart', CartSchema); 