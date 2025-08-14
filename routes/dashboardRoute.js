const {sendData} = require('../controllers/dashboardController');
const express = require('express');
const dashboardRouter = express.Router();

dashboardRouter.route('/')
    .get(sendData);


module.exports = dashboardRouter;