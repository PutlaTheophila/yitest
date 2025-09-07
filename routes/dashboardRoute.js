const {sendData , test} = require('../controllers/dashboardController');
const express = require('express');
const dashboardRouter = express.Router();

dashboardRouter.route('/')
    .get(sendData);

dashboardRouter.route('/test')
    .get(test);


module.exports = dashboardRouter;