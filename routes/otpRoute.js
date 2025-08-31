const express = require("express");
const otpRouter = express.Router();

const {getAllOpts} = require('../controllers/otpController.js');

otpRouter.route('/').get(getAllOpts)


module.exports = otpRouter;

 