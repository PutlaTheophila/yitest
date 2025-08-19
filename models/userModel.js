const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true, // assuming phone number is unique identifier
  },
  isVerified: {
    type: Boolean,
    default: false, // for OTP verification status
  },
  isDisabled:{
    type: Boolean,
    default:false
  },
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
  },
  industry: {
    type: [String],
    required: true,
    enum: [
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Real Estate',
      'Manufacturing',
      'Retail & Trade',
      'F&B / Hospitality',
      'Media & Marketing',
      'Other',
    ],
  },
  yiRole: {
    type: String,
    enum: [
      'Member',
      'EC-Chair',
      'EC-CoChair',
      'Steering Committee',
      'Chair',
      'Co-Chair'
    ],
    default: 'Member',
  },
  interestAreas: {
    type: [String],
    required: true,
    enum: [
      'Travel', 'Music', 'Fitness', 'Sports', 'Reading',
      'Food & Cooking', 'Photography', 'Art & Design', 'Fashion',
      'Tech & Gadgets', 'Yoga & Wellness', 'Golf', 'Trekking', 'Writing',
      'Startups & Innovation', 'Volunteering', 'Film & Theatre',
      'Dancing', 'Public Speaking', 'Investing',
    ],
  },
  userRole: {
    type: String,
    enum: ['admin', 'co-admin', 'member'],
    default: 'member',
  },
  yiTeam: {
    type: String,
    enum: ['J9 Power', 'Piramal Fires', 'Zoff Strikers', 'OBCL Riders', 'NA','not-specified'],
    default: 'not-specified',
  },
  // yiMytri: {
  //   type: String,
  //   enum: ['Membership', 'Yuva', 'Thalir', 'Rural Initiative', 'NA','not-specified' ],
  //   default: 'not-specified',
  // },
  // yiProjects: {
  //   type: String,
  //   enum: ['Masoom', 'Road safety', 'Climate Action', 'Accessibility', 'Health', 'NA','not-specified'],
  //   default: 'not-specified',
  // },
  yiInitiatives: {
    type: String,
    enum: [
      'Membership',
      'Yuva',
      'Thalir',
      'Rural Initiative',
      'Masoom',
      'Road Safety',
      'Climate Action',
      'Accessibility',
      'Health',
      'Learning',
      'Entrepreneurship',
      'Innovation',
      'not-specified',
      'NA'
    ],
    default: 'not-specified',
  },
  yearOfJoining: {
    type: String,
    default: 'not-specified',
    validate: {
      validator: function (v) {
        return v === 'NA' || (/^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= new Date().getFullYear());
      },
      message: props => `${props.value} is not a valid year`
    }
  },
  events: {
    rsvps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      }
    ],
    attended: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      }
    ]
  },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
