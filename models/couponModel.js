const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
  },
  discount: {
    type: String,
    required: [true, 'Discount is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  logoUrl: {
    type: String,
    required: [true, 'Logo URL is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  color :{
     type: String,
    required: [true, 'color is required'],
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
