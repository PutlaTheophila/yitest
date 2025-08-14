const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');

// Get notifications (polling endpoint)
notificationRouter.get('/', (req,res , next) =>{console.log('hiiii') ; next()},notificationController.getNotifications);

// Mark a notification as read
notificationRouter.patch('/:id/read', notificationController.markAsRead);

// (Optional) Create a notification
notificationRouter.post('/', notificationController.createAnnouncement);

module.exports = notificationRouter;
