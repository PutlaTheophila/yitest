const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncErrorHandler = require('./asyncErrorHandler.js');

const  createToken =  (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET , {
    expiresIn: '30d',
  });
};


const verifyToken  = async(token)  =>{
  const decoded = jwt.verify(token, process.env.JWT_SECRET );
  console.log(decoded);
  return decoded;
}


const protect = async (req, res, next) => {
    console.log(req.cookie);
  const { token } = req?.cookies;
    console.log(token)
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET );
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
    protect,
    createToken,
    verifyToken
}