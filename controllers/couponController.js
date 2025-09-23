const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CustomError = require('../utils/customError.js');
const { verifyToken } = require('../utils/jwt.js');
const Coupon = require('../models/couponModel.js');
const User = require('../models/userModel.js');
const { verify } = require('jsonwebtoken');
const {sendNotifications} = require('../utils/notificationSender.js');

exports.createCoupon = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers.token;
  console.log('inside coupon controller ')
  if (!token) {
    return next(new CustomError('Please login to continue', 401));
  }
  const { id: userId } = await verifyToken(token);
  console.log(userId);
  const user = await User.findById(userId);
  console.log(user);
  console.log(user.userRole);

  if (!user || user.userRole != 'admin') {
    return next(new CustomError('Unauthorized access', 403));
  }

  const { discount, description  , color , brand} = req.body;

  if (!discount || !description || !brand) {
    return next(new CustomError('Discount , description and brand name are required', 400));
  }

  if (!req.file || !req.file.path) {
    return next(new CustomError('Logo image is required', 400));
  }

  let logoUrl = req.file.path;

  const newCoupon = await Coupon.create({
    discount,
    description,
    logoUrl,
    color,
    brand
  });
  console.log(newCoupon);

  try {
    const usersToNotify = await User.find({});
    const userIds = usersToNotify.map(u => u._id);
    await sendNotifications({
      userIds,
      title: `New Coupon: ${newCoupon.brand}`,
      message: `New coupon from  "${newCoupon.brand}" has been created. Check it out!`,
      imageUrl: newCoupon.logoUrl,
      refId: newCoupon._id,
      type: 'Coupon',
    });
  } catch (err) {
    console.error('⚠️ Notification sending failed:', err.message);
  }

  res.status(200).json({
    success: true,
    message: 'Coupon created successfully',
    newCoupon,
  });
});



exports.getCoupons = asyncErrorHandler(async (req, res, next) => {

    const token = req.headers.token;
    console.log('inside coupon controller ')
    if (!token) {
        return next(new CustomError('Please login to continue', 401));
    }
    const { id: userId } = await verifyToken(token);
    console.log(userId);
    const user = await User.findById(userId);
    console.log(user);
    console.log(user.userRole);

        let isAdmin = false;
    if (user && user.userRole == 'admin') {
        isAdmin = true;
    }

  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons,
    isAdmin
  });
});


exports.deleteCoupon = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;
    // await new Promise(resolve => setTimeout(resolve, 2000));
  const coupon = await Coupon.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
  });
});


