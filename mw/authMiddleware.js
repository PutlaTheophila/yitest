
const { verifyToken } = require('../utils/jwt.js'); 

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token?.split(' ')[1] || req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
      console.log('auth token verification failed');
    }

    req.user = decoded; 
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(403).json({ success: false, message: 'Authentication failed.' });
  }
};

module.exports = authMiddleware;
