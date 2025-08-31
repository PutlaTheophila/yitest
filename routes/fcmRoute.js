const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController.js');
const authGuard = require('../mw/authMiddleware.js'); // checks if valid user


router.route('/')
    .post(authGuard , fcmController.saveDeviceToken)


module.exports = router;