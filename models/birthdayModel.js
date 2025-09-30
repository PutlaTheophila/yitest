const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema({
  birthdayUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The user whose birthday it is
    required: true,
  },
  greetings: [
    {
      greetedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User who sent the greeting
        required: true,
      },
      text: {
        type: String,
        required: true, // Greeting message
      },
      createdAt: {
        type: Date,
        default: Date.now, // Timestamp of greeting
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Birthday', birthdaySchema);
