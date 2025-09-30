// const {sendData , test} = require('../controllers/dashboardController');
// const express = require('express');
// const dashboardRouter = express.Router();

// dashboardRouter.route('/')
//     .get(sendData);

// dashboardRouter.route('/test')
//     .get(test);


// module.exports = dashboardRouter;



const { sendData, test, getGreetings, addGreeting } = require('../controllers/dashboardController');
const express = require('express');
const dashboardRouter = express.Router();

dashboardRouter.route('/')
  .get(sendData);

dashboardRouter.route('/test')
  .get(test);

dashboardRouter.route('/birthday/:userId')
  .get(getGreetings);

dashboardRouter.route('/birthday/:userId/greet')
  .post(addGreeting);

module.exports = dashboardRouter;
