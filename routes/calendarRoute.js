const express = require('express');
const calendarRouter = express.Router();
const {sendEventDates, sendEventsForDate} = require('../controllers/calendarController.js');

calendarRouter.route('/')
    .get(sendEventDates)

calendarRouter.route('/:date')
    .get(sendEventsForDate)

module.exports = calendarRouter;