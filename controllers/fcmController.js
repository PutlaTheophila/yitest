// controllers/deviceToken.controller.js
const DeviceToken = require('../models/fcmTokenModel.js');

exports.saveDeviceToken = async (req, res) => {
    console.log('hi from token saver in db');
  try {
    const { token, platform, deviceInfo } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!token || !platform || !userId) {
      return res.status(400).json({ success: false, message: 'Missing token, platform or user ID.' });
    }

    // Upsert (insert if not found, else update)
    await DeviceToken.updateOne(
      { token },
      { userId, platform, deviceInfo, createdAt: new Date() },
      { upsert: true }
    );
    console.log('token created successfully');
    res.status(200).json({ success: true, message: 'Device token saved successfully.' });
  } catch (err) {
    console.error('Error saving device token:', err);
    res.status(500).json({ success: false, message: 'Server error saving token.' });
  }
};

exports.deleteDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ success: false, message: 'Missing token' });

    await DeviceToken.deleteOne({ token });

    res.status(200).json({ success: true, message: 'Device token deleted' });
  } catch (err) {
    console.error('Error deleting token:', err);
    res.status(500).json({ success: false, message: 'Error deleting token' });
  }
};
