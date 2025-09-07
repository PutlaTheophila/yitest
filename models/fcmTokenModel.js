// Example Schema (Node.js + Mongoose)
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: String,
  platform: String,  // android / ios / web
  deviceInfo: String, // optional
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DeviceToken', tokenSchema);
