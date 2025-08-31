const express = require('express');
const upload = require('../mw/cloudinaryMiddleware.js');
const {
  getAllEvents,
  createEvent,
  getEvent,
  deleteEvent,
  createEvents,
  rsvpEvent,
  getEventsForEventsScreen,
  upvoteEvent,
  updateEvent,
  markAttendance,
  attendanceStats,
} = require('../controllers/eventController');

const eventRouter = express.Router();

// ✅ STATIC routes first
eventRouter.route('/attendance')
  .post(markAttendance)
  .get(attendanceStats);

eventRouter.route('/allevents').get(getEventsForEventsScreen);
eventRouter.route('/createmultiple').post(createEvents);
eventRouter.route('/rsvpevent/:id').get(rsvpEvent);
eventRouter.route('/upvote/:id').get(upvoteEvent);

// ✅ CRUD routes
eventRouter.route('/')
  .get(getAllEvents)
  .post(upload.single('image'), createEvent);

// ❗️DYNAMIC route last
eventRouter.route('/:id')
  .get(getEvent)
  .delete(deleteEvent)
  .patch(upload.single('image'), updateEvent);

module.exports = eventRouter;
