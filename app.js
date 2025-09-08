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

const detectDevice = (userAgent) => {
  if (/android/i.test(userAgent)) {
    return 'android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'ios';
  } else {
    return 'other';
  }
};

app.get('/event/:id', (req, res) => {
  const eventId = req.params.id;
  const userAgent = req.headers['user-agent'] || '';
  const device = detectDevice(userAgent);

  if (device === 'android') {
    // Redirect to Google Play Store
    res.redirect('https://play.google.com/store/apps/details?id=in.pranaa.yi');
  } else if (device === 'ios') {
    // Redirect to App Store
    res.redirect('https://apps.apple.com/in/app/whatson-yi/id6748990967');
  } else {
    // Serve a styled webpage for other devices (e.g., desktop)
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event ${eventId} - YI What's On</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', sans-serif;
            background-color: #ECE5DD;
            color: #4A4A4A;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            text-align: center;
          }
          .container {
            max-width: 600px;
            width: 100%;
            padding: 40px;
            background-color: #FFFFFF;
            border-radius: 28px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #4A4A4A;
            margin-bottom: 16px;
          }
          p {
            font-size: 16px;
            font-weight: 400;
            color: #7A7A7A;
            margin-bottom: 24px;
          }
          .button-container {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
          }
          a.button {
            display: inline-flex;
            align-items: center;
            padding: 12px 24px;
            background-color: #536142;
            color: #FFFFFF;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            border-radius: 24px;
            transition: background-color 0.3s ease;
          }
          a.button:hover {
            background-color: #3d4a2f;
          }
          a.button img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
          }
          @media (max-width: 600px) {
            .container {
              padding: 24px;
              border-radius: 20px;
            }
            h1 {
              font-size: 20px;
            }
            p {
              font-size: 14px;
            }
            a.button {
              padding: 10px 20px;
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Replace the src with your actual logo URL -->
          <img src="./assets/Yi_logo.png" alt="YI Logo" class="logo">
          <h1>Event ID: ${eventId}</h1>
          <p>Download the YI What's On App to view this event!</p>
          <div class="button-container">
            <a href="https://play.google.com/store/apps/details?id=in.pranaa.yi" class="button">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play">
              Get on Google Play
            </a>
            <a href="https://apps.apple.com/in/app/whatson-yi/id6748990967" class="button">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store">
              Get on App Store
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
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
