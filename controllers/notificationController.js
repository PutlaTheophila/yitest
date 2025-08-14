const Notification = require('../models/notificationModel.js');
const { verifyToken } = require('../utils/jwt.js');
const User = require('../models/userModel.js');
const admin = require('../utils/firebaseAdmin.js');
const DeviceToken = require('../models/fcmTokenModel.js');
const asyncErrorHandler = require('../utils/asyncErrorHandler.js');
const notificationSender = require('../utils/notificationSender.js');

// exports.getNotifications = async (req, res) => {
//   try {
//     const token = req.headers.token;
//     const { id: userId } = await verifyToken(token);

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "Missing userId" });
//     }

//     const page = parseInt(req.query.page || '1');
//     const limit = parseInt(req.query.limit || '20');
//     const skip = (page - 1) * limit;

//     const user = await User.findById(userId);
//     const isAdmin =
//       ['EC', 'Chair'].includes(user.yiRole) ||
//       ['admin', 'co-admin'].includes(user.userRole);

//     const filter = { userId };

//     const notifications = await Notification.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Notification.countDocuments(filter);

//     res.status(200).json({
//       success: true,
//       notifications,
//       isAdmin,
//       total,
//       page,
//       hasMore: skip + notifications.length < total,
//     });

//     // Mark as read in background
//     setImmediate(async () => {
//       const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
//       if (unreadIds.length > 0) {
//         await Notification.updateMany({ _id: { $in: unreadIds } }, { $set: { read: true } });
//       }
//     });

//   } catch (err) {
//     console.error('❌ Fetch error:', err.message);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };



exports.getNotifications = async (req, res) => {
  try {
    const token = req.headers.token;
    const { id: userId } = await verifyToken(token);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    const isAdmin =
      ['EC', 'Chair'].includes(user.yiRole) ||
      ['admin', 'co-admin'].includes(user.userRole);

    const filter = { userId };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      notifications,
      isAdmin,
      total,
      page,
      hasMore: skip + notifications.length < total,
    });

    // Mark as read in background
    setImmediate(async () => {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
      if (unreadIds.length > 0) {
        await Notification.updateMany({ _id: { $in: unreadIds } }, { $set: { read: true } });
      }
    });

  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

//not yet implemented
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    const notif = await Notification.create({ userId, title, message });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.createAnnouncement = asyncErrorHandler(async (req, res) => {
  const token = req.headers?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const { id: userId } = await verifyToken(token);
  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const isPrivileged =
    ['admin', 'co-admin'].includes(user.userRole) ||
    user.yiRole === 'EC';
  if (!isPrivileged) {
    return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
  }

  const { title, message, sendToAll, filters } = req.body;

  let userQuery = {};
  if (!sendToAll && filters) {
    const orQuery = [];

    for (const [key, values] of Object.entries(filters)) {
      if (Array.isArray(values) && values.length > 0) {
        orQuery.push({ [key]: { $in: values } });
      }
    }

    if (orQuery.length > 0) {
      userQuery = { $or: orQuery };
    }
  }

  // Log query structure for debugging
  console.log("User query:", JSON.stringify(userQuery, null, 2));

  // Fetch all users if sendToAll is true, else use constructed query
  const targetUsers = sendToAll
    ? await User.find({}, '_id')
    : await User.find(userQuery, '_id');

  const targetUserIds = targetUsers.map(u => u._id.toString());

  console.log(targetUsers);

  if (targetUserIds.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No users matched the filters, no notification sent.',
    });
  }

  console.log(`📣 Sending to ${targetUserIds.length} users`);

  await notificationSender.sendNotifications({
    userIds: targetUserIds,
    type: 'Announcement',
    refId: userId,
    title,
    message,
    imageUrl: '',
  });
  console.log('hiigdh');
  console.log(targetUserIds)

  return res.status(200).json({
    success: true,
    message: 'Notification sent successfully',
  });
});
