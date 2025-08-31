const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // this id tells us whom the notification belong to
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:{
    type:String,
    enum:['Event','User','Announcement'],
    required:true
  },
  imageUrl:{
    type:String
  },
  title: {
    type:String,
    required:true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type',
  },
  message: {
    type:String,
    required:true
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
