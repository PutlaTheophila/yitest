const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/authController");
const loginRouter = express.Router();

loginRouter.route('/sendotp')
    .post(sendOtp)
loginRouter.route('/verifyotp')
    .post(verifyOtp)

module.exports = loginRouter;