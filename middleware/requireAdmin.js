// middleware/auth.js

const User = require('../models/User');

exports.requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Assuming user ID is populated via JWT or session
    const user = await User.findById(userId);

    if (!user || !['Admin', 'CoAdmin'].includes(user.userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
