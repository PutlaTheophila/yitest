// const express = require('express');
// const userRouter = require('./routes/userRoute.js');
// const authRouter = require('./routes/authRoute.js');
// const otpRouter = require('./routes/otpRoute.js');
// const eventRouter = require('./routes/eventRoute.js');
// const dashboardRouter = require('./routes/dashboardRoute.js');
// const calendarRouter = require('./routes/calendarRoute.js');
// const resolveMapsLink = require('./utils/resolveMapsLink.js');
// const adminRoutes = require('./routes/adminRoutes');
// const notificationRouter = require('./routes/notificationRoute.js');
// const fcmRouter = require('./routes/fcmRoute.js');
// const bodyParser = require('body-parser');
// const CustomError = require('./utils/customError.js');
// const couponRouter = require('./routes/couponRoute.js');
// const assetLinksRouter = require('./routes/assetLinkRoutes.js');
// const User = require('./models/userModel.js');
// require('dotenv').config();
// const cors = require('cors');
// const path = require('path');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// //middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log(`Request from ${req.ip} to ${req.originalUrl}`);
//   next();
// });

// app.use((req, res, next) => {
//   console.log(`➡️  Request: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // routes
// app.use('/api/v1/user', userRouter);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/otp', otpRouter);
// app.use('/api/v1/event', eventRouter);
// app.use('/api/v1/dashboard', dashboardRouter);
// app.use('/api/v1/calendar', calendarRouter);
// app.use('/api/v1/notification', notificationRouter);
// app.use('/api/v1/fcm', fcmRouter);
// app.use('/api/v1/coupon', couponRouter);
// app.use('/.well-known/assetlinks.json', assetLinksRouter);

// app.use((err, req, res, next) => {
//   console.error('global error handler called....');
//   console.error(err);

//   res.status(err.statusCode || 500).json({
//     status: err.status || 'error',
//     message: err.message || 'Something went wrong',
//     isOperational: err.isOperational || false,
//   });
// });

// app.get('/privacy-policy', (req, res) => {
//   res.sendFile(path.join(__dirname, './privacy-policy.html'));
// });

// app.get('/support', (req, res) => {
//   res.sendFile(path.join(__dirname, './support.html'));
// });

// app.get('/', async (req, res) => {
//   const today = new Date();
//   const todayMonth = today.getMonth() + 1; // 0-indexed
//   const todayDate = today.getDate();

//   const birthdayUsers = await User.aggregate([
//     {
//       $addFields: {
//         birthMonth: { $month: "$dateOfBirth" },
//         birthDate: { $dayOfMonth: "$dateOfBirth" },
//       },
//     },
//     {
//       $match: {
//         dateOfBirth: { $ne: null },
//         birthMonth: todayMonth,
//         birthDate: todayDate,
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         name: 1,
//         profilePhotoUrl: 1,
//         yiTeam: 1,
//         yiRole: 1,
//         yiInitiatives: 1,
//         yiMytri: 1,
//         yiProjects: 1,
//         mobile: 1,
//         dateOfBirth: 1,
//       },
//     },
//   ]);

//   return res.status(200).json({
//     status: 'success',
//     data: {
//       birthdayUsers,
//     },
//   });
// });

// module.exports = app;




const express = require('express');
const userRouter = require('./routes/userRoute.js');
const authRouter = require('./routes/authRoute.js');
const otpRouter = require('./routes/otpRoute.js');
const eventRouter = require('./routes/eventRoute.js');
const dashboardRouter = require('./routes/dashboardRoute.js');
const calendarRouter = require('./routes/calendarRoute.js');
const resolveMapsLink = require('./utils/resolveMapsLink.js');
const adminRoutes = require('./routes/adminRoutes');
const notificationRouter = require('./routes/notificationRoute.js');
const fcmRouter = require('./routes/fcmRoute.js');
const bodyParser = require('body-parser');
const CustomError = require('./utils/customError.js');
const couponRouter = require('./routes/couponRoute.js');
const assetLinksRouter = require('./routes/assetLinkRoutes.js');
const User = require('./models/userModel.js');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Request from ${req.ip} to ${req.originalUrl}`);
  next();
});

app.use((req, res, next) => {
  console.log(`➡️  Request: ${req.method} ${req.originalUrl}`);
  next();
});

// routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/otp', otpRouter);
app.use('/api/v1/event', eventRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/fcm', fcmRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/.well-known/assetlinks.json', assetLinksRouter);

// Deep link endpoint (MUST exist for Android App Links)
app.get('/event/:eventId', (req, res) => {
  const { eventId } = req.params;
  res.send(`
    <html>
      <head>
        <title>Event ${eventId}</title>
        <meta name="description" content="YI App Event Deep Link" />
      </head>
      <body>
        <h1>Event ${eventId}</h1>
        <p>If this page opened in browser, please open the YI App to view the event.</p>
      </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('global error handler called....');
  console.error(err);

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Something went wrong',
    isOperational: err.isOperational || false,
  });
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, './privacy-policy.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, './support.html'));
});

app.get('/', async (req, res) => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1; // 0-indexed
  const todayDate = today.getDate();

  const birthdayUsers = await User.aggregate([
    {
      $addFields: {
        birthMonth: { $month: "$dateOfBirth" },
        birthDate: { $dayOfMonth: "$dateOfBirth" },
      },
    },
    {
      $match: {
        dateOfBirth: { $ne: null },
        birthMonth: todayMonth,
        birthDate: todayDate,
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        profilePhotoUrl: 1,
        yiTeam: 1,
        yiRole: 1,
        yiInitiatives: 1,
        yiMytri: 1,
        yiProjects: 1,
        mobile: 1,
        dateOfBirth: 1,
      },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      birthdayUsers,
    },
  });
});

module.exports = app;
