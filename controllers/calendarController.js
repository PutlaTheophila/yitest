const { ContentInstance } = require("twilio/lib/rest/content/v1/content");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const {verifyToken} = require('../utils/jwt.js');
const Event = require('../models/eventModel.js');
const User = require('../models/userModel.js');
const mongoose = require('mongoose');

// const sendEventDates = asyncErrorHandler(async(req,res)=>{
//     console.log('sending...');
//     const token = req.headers.token;
//     const data =  await verifyToken(token);
//     console.log(data.id);
//     //  const userId = new mongoose.Types.ObjectId(data.id);
//     const allEvents = await Event.find({}, 'title date');
//  const user = await User.findById(data.id).populate({
//     path: 'events.rsvps',
//     select: 'title date'
//   });

//   const userRSVPedEvents = user?.events?.rsvps || [];

//   res.status(200).json({
//     status: 'success',
//     data: {
//       allEvents,
//       userRSVPedEvents
//     }
//   });
// });


const sendEventDates = asyncErrorHandler(async (req, res) => {
  console.log('sending... event dates');
  const token = req.headers.token;
  const data = await verifyToken(token);
  console.log(data.id);

  // 1. Send one event per unique date with 'title' = first tag
  const allEvents = await Event.aggregate([
    {
      $project: {
        date: 1,
        title: { $arrayElemAt: ["$tags", 0] }  // rename first tag as "title"
      }
    },
    {
      $group: {
        _id: "$date",
        title: { $first: "$title" },
        date: { $first: "$date" }
      }
    },
    {
      $project: {
        _id: 0,
        title: 1,
        date: 1
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);

  // 2. Get RSVP'd events for user (keep original title and date)
  const user = await User.findById(data.id).populate({
    path: 'events.rsvps',
    select: 'title date'
  });

  const userRSVPedEvents = user?.events?.rsvps || [];

  res.status(200).json({
    status: 'success',
    data: {
      allEvents,
      userRSVPedEvents
    }
  });
});


// no more usefull dissolve this later
const sendEventsForDate = asyncErrorHandler(async (req, res) => {
  const dateStr = req.params.date; // e.g., "2025-07-05"
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const token = req.headers?.token;
  const { id: userId } = await verifyToken(token);

  const events = await Event.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  })
    .select('title tags venue date endDate upvotes rsvps bannerImageUrl category maxCapacity')
    .lean();

  const eventsWithMeta = events.map((event) => {
    const upvotes = event.upvotes || [];
    const rsvps = event.rsvps || [];

    const hasUpvoted = upvotes.some((u) => u.toString() === userId);
    const hasRSVPed = rsvps.some(
      (r) => r.userId?.toString() === userId
    );

    return {
      _id: event._id,
      title: event.title,
      tags: event.tags,
      bannerImageUrl: event.bannerImageUrl,
      venue: event.venue,
      date: event.date,
      endDate: event.endDate,
      hasUpvoted,
      hasRSVPed,
      totalUpvotes: upvotes.length,
      totalRSVPs: rsvps.length,
      rsvpDeadline:event.rsvpDeadline,
      category:event.category,
      maxCapacity:event.maxCapacity
    };
  });

  res.status(200).json({
    status: 'success',
    events: eventsWithMeta,
  });
});






module.exports = {
    sendEventDates,
    sendEventsForDate
}