const mongoose = require('mongoose');

// ENUMS
const EVENT_TYPE = ['SIG', 'Initiative', 'Chapter', 'National', 'Social'];

const INTEREST_TAGS = [
  'Travel', 'Music', 'Fitness', 'Sports', 'Reading', 'Food & Cooking',
  'Photography', 'Art & Design', 'Fashion', 'Tech & Gadgets',
  'Yoga & Wellness', 'Golf', 'Trekking', 'Writing', 'Startups & Innovation',
  'Volunteering', 'Film & Theatre', 'Dancing', 'Public Speaking', 'Investing'
];

const SYSTEM_TAGS = ['Featured', 'Trending', 'Popular']; // Upvote or admin-controlled

const eventSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  
  description: { type: String , required : true},
  bannerImageUrl: { type: String , required : true }, // S3 or Firebase image link

  // Type & Tags
  category: { type: String, enum: EVENT_TYPE, required: true },
  tags: {
    type: [String],
    enum: [...INTEREST_TAGS, ...SYSTEM_TAGS],
    default: [],
    required:true
  },

  // Scheduling
  date: { type: Date, required: true },
  endDate: { type: Date , required: true },
  rsvpDeadline: { type: Date , required: true},
  maxCapacity: { type: Number},

  // Location or meeting link
  venue: {
    isOnline: { type: Boolean, default: false },
    name: { type: String },
    address: { type: String },
    locationLink: { type: String } // Maps link or Zoom/Meet link
  },

  // Organizing team or person
  host: {
    name: { type: String },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  },

  // Admin control
  // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },

  // Upvotes (used to mark Trending/Featured)
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // RSVP list
  rsvps: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // status: { type: String, enum: RSVP_STATUS, default: 'Going' },
    timestamp: { type: Date, default: Date.now }
  }],

  // QR-based check-ins
  qrCheckIns: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedInAt: { type: Date, default: Date.now }
  }],


  attendees: [{
    name: { type: String},
    por: { type: String },
    photoUrl: { type: String }
  }],
  // Event attachments (agenda, brochures, etc.)
  attachments: [{
    name: { type: String },
    url: { type: String }
  }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

});

// Index for faster feed and filter queries
eventSchema.index({ category: 1, date: -1 });
eventSchema.index({ 'tags': 1 });

module.exports = mongoose.model('Event', eventSchema);
