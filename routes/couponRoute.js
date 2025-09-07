const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const upload = require('../mw/cloudinaryMiddleware');
const { defaultArgs } = require('puppeteer');

router.route('/')
    .post(upload.single('image'),couponController.createCoupon)
    .get(couponController.getCoupons);

router.route('/:id')
    .delete(couponController.deleteCoupon);

module.exports = router;