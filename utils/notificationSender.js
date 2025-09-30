const Notification = require('../models/notificationModel.js');
const { verifyToken } = require('./jwt.js');
const User = require('../models/userModel.js');
const admin = require('./firebaseAdmin.js');
const DeviceToken = require('../models/fcmTokenModel.js');

exports.sendNotifications = async ({ userIds, type, refId, title, message, imageUrl }) => {
  console.log('hi from service ');
  try {
    // 1. Save In-App Notifications
    const inAppNotifications = userIds.map(userId => ({
      userId,
      type,
      refId,
      title,
      message,
      imageUrl,
    }));
    await Notification.insertMany(inAppNotifications);

    // 2. Fetch FCM tokens from DeviceToken model
    const tokensData = await DeviceToken.find({
      userId: { $in: userIds },
    }).select('token');

    const fcmTokens = tokensData.map(t => t.token).filter(Boolean);

    if (fcmTokens.length === 0) {
      console.log('⚠️ No FCM tokens found for the given users.');
      return;
    }

    // 3. Prepare the FCM payload
    const payload = {
      notification: {
        title,
        body: message,
        ...(imageUrl && { image: imageUrl })
      },
      // this data is related to what is the notification about like if this notification
      // is due to event creation it will refrence that event id here and also the type will be event
      data: {
        type,
        refId: refId.toString(),
      },
    };

    // 4. Send FCM Push Notifications
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      ...payload,
    });

    console.log(`📤 FCM sent: ${response.successCount} success, ${response.failureCount} failed`);
    if (response.failureCount > 0) {
      response.responses.forEach((r, i) => {
        if (!r.success) {
          // console.warn(`Token failed: ${fcmTokens[i]} => ${r.error.message}`);
        }
      });
    }
  } catch (error) {
    console.error('Error sending notifications:', error.message);
    throw new Error('Notification sending failed');
  }
};