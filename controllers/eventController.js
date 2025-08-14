const Event = require('../models/eventModel.js');
const asyncErrorHandler = require('../utils/asyncErrorHandler.js');
const CustomError = require('../utils/customError.js');
const User = require('../models/userModel.js');
const { verify } = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt.js');
const resolveMapsLink = require('../utils/resolveMapsLink.js');
const Notification = require('../models/notificationModel.js');
const {sendNotifications} = require('../utils/notificationSender.js');
const mongoose = require('mongoose');



// const createEvent = asyncErrorHandler(async (req, res) => {
//   const token = req.headers.token;
//   if(!token){
//     return next(new CustomError('please login'))
//   }
//   const {id : userId} = await verifyToken(token);

//   try {
//     const data = req.body;
//     console.log(data, 'hello');

//     if (!req.file) {
//       return res.status(400).json({ error: 'Image required' });
//     }
//     console.log(req.file.path);
//     console.log('hi...');

//     const tagsArray = typeof data.tags === 'string' ? data.tags.split(',') : [];
//     const event = await Event.create({
//       ...data,
//       venue: {
//         name: data.venueName,
//         address: data.venueAddress,
//         locationLink: data.venueLink,
//         isOnline: data.isOnline,       
//       },
//       tags: tagsArray,
//       bannerImageUrl: req.file.path,
//     });
//     const usersToNotify = await User.find({}); 
//     const userIds = usersToNotify.map((u) => u._id);
//     console.log(usersToNotify)
//     try {
//       await sendNotifications({
//         userIds,
//         title: `New Event: ${event.title}`,
//         message: `An event "${event.title}" has been created. Check it out!`,
//         imageUrl: req.file.path,
//         refId: event._id,
//         type: 'Event',
//       });
//     } catch (err) {
//       console.error('⚠️ Notification sending failed:', err.message);
//       // You may optionally log this to a monitoring tool
//     }
//     res.status(200).json({
//       status: 'success',
//     });

//   } catch (err) {
//     console.log(err);
//   }
// });


// ENUMS for validation
const EVENT_TYPE = ['SIG', 'Initiative', 'Chapter', 'National', 'Social'];
const INTEREST_TAGS = [
  'Travel', 'Music', 'Fitness', 'Sports', 'Reading', 'Food & Cooking',
  'Photography', 'Art & Design', 'Fashion', 'Tech & Gadgets',
  'Yoga & Wellness', 'Golf', 'Trekking', 'Writing', 'Startups & Innovation',
  'Volunteering', 'Film & Theatre', 'Dancing', 'Public Speaking', 'Investing'
];
const SYSTEM_TAGS = ['Featured', 'Trending', 'Popular'];

const createEvent = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers.token;
  console.log(token);
  if (!token) return next(new CustomError('Please login to create an event', 401));

  const { id: userId } = await verifyToken(token);
  const data = req.body;

  if (!req.file) {
    return next(new CustomError('Banner image is required', 400));
  }

  // Parse tags
  const tagsArray = typeof data.tags === 'string' ? data.tags.split(',') : data.tags || [];

  // Input Validation
  if (!data.title || data.title.trim() === '') {
    return next(new CustomError('Event title is required', 400));
  }
  if (!data.description || data.description.trim() === '') {
    return next(new CustomError('Description is required', 400));
  }
  if (!EVENT_TYPE.includes(data.category)) {
    return next(new CustomError('Invalid category selected', 400));
  }
  const allValidTags = [...INTEREST_TAGS, ...SYSTEM_TAGS];
  const invalidTags = tagsArray.filter(tag => !allValidTags.includes(tag));
  if (invalidTags.length > 0) {
    return next(new CustomError(`Invalid tags: ${invalidTags.join(', ')}`, 400));
  }

  // Date checks
  const start = new Date(data.date);
  const end = new Date(data.endDate);
  const rsvpDeadline = new Date(data.rsvpDeadline);
  if (isNaN(start) || isNaN(end) || isNaN(rsvpDeadline)) {
    return next(new CustomError('Invalid date or time format', 400));
  }
  if (end < start) {
    return next(new CustomError('End date cannot be before start date', 400));
  }
  if (rsvpDeadline > start) {
    return next(new CustomError('RSVP deadline must be before event start time', 400));
  }

  // Max capacity
  const maxCapacity = parseInt(data.maxCapacity);
  if (isNaN(maxCapacity) || maxCapacity <= 0) {
    return next(new CustomError('Max capacity must be a valid positive number', 400));
  }

  let resolvedMapsLink;
  // For offline events, venue details are mandatory
  const isOnline = data.isOnline === 'true' || data.isOnline === true;
  if (!isOnline) {
    // if (!data.venueName || !data.venueAddress) {
    //   return next(new CustomError('Venue name and address are required for offline events', 400));
    // }
    resolvedMapsLink = await resolveMapsLink(data?.venueAddress);
  }

  // Create event
  const event = await Event.create({
    title: data.title.trim(),
  
    description: data.description.trim(),
    bannerImageUrl: req.file.path,
    category: data.category,
    tags: tagsArray,
    date: start,
    endDate: end,
    rsvpDeadline,
    maxCapacity,
    venue: {
      name: data.venueName || '',
      address: data.venueAddress || '',
      locationLink: resolvedMapsLink || '',
      isOnline,
    },
    createdBy: userId,
    isPublished: false,
  });

  // Notify users (optional)
  try {
    const usersToNotify = await User.find({});
    const userIds = usersToNotify.map(u => u._id);
    await sendNotifications({
      userIds,
      title: `New Event: ${event.title}`,
      message: `An event "${event.title}" has been created. Check it out!`,
      imageUrl: req.file.path,
      refId: event._id,
      type: 'Event',
    });
  } catch (err) {
    console.error('⚠️ Notification sending failed:', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'Event created successfully',
    eventId: event._id,
  });
});


const updateEvent = asyncErrorHandler(async (req, res) => {
  console.log('in update event');
  try {
    const eventId = req.params.id;
    const data = req.body;
    console.log(data);

    let resolvedMapsLink;

    if(data.venueAddress){
      console.log('location updating ');
      resolvedMapsLink =  await resolveMapsLink(data.venueAddress);
    }
    console.log(resolvedMapsLink);

    const updateFields = {
      ...data,
      venue: {
        name: data.venueName,
        address: data.venueAddress,
        locationLink: resolvedMapsLink,
        isOnline: data.isOnline,
      },
    };

    // Handle tags if sent as comma-separated string
    if (typeof data.tags === 'string') {
      updateFields.tags = data.tags.split(',').map(tag => tag.trim());
    }

    // If image is uploaded, update bannerImageUrl
    if (req.file) {
      updateFields.bannerImageUrl = req.file.path;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateFields,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({
      status: 'success',
      updatedEvent,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



const getAllEvents = asyncErrorHandler(async(re, res)=>{
  console.log('hia');
    const events = await Event.find({});
    res.status(200).json({
        status : 'success',
        nbHits : events.length,
        events
    })
})

const getEvent = asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new CustomError('Invalid event ID', 400));

  const event = await Event.findById(id);
  if (!event) return next(new CustomError('No event record found', 400));

  // Clone event as plain object to modify safely
  const eventObj = event.toObject();

  // Optional: Resolve Google Maps short link
  const address = eventObj.venue?.address;
  if (typeof address === 'string' && address.trim() !== '') {
    if (address.includes('maps.app.goo.gl')) {
      // try {
      //   const resolvedUrl = await resolveMapsLink(address);
      //   eventObj.venue.address = resolvedUrl;
      // } catch (err) {
      //   console.error('Failed to resolve maps link:', err.message);
      //   // Keep original address if resolving fails
      // }
    } else {
      eventObj.venue.address = address;
    }
  } else {
    eventObj.venue.address = '';
  }

  // Check token for user-specific flags
  const token = req.headers.token;

  if (token) {
    try {
      const { id: userId } = await verifyToken(token);
      const user = await User.findById(userId);

      if (user) {
        eventObj.userRole = user.yiRole;

        const isAdmin =
          user.userRole === 'admin' ||
          user.userRole === 'co-admin';

        eventObj.isAdmin = isAdmin;

        // If admin, include RSVP user info
        if (isAdmin) {
          // RSVP list
          const rsvpUserIds = event.rsvps.map(r => r.userId);
          const rsvpUsers = await User.find({ _id: { $in: rsvpUserIds } }).select(
            '_id name mobile yiTeam yiMytri yiProjects yiInitiatives'
          );
          eventObj.rsvpList = rsvpUsers;

          // QR Check-in list
          const checkInUserIds = event.qrCheckIns.map(c => c.userId);
          const checkInUsers = await User.find({ _id: { $in: checkInUserIds } }).select(
            '_id name mobile yiTeam yiMytri yiProjects yiInitiatives'
          );
          eventObj.qrCheckInList = checkInUsers;
        }
      }

      eventObj.rsvpCount = event.rsvps.length;
      eventObj.upvoteCount = event.upvotes.length;

      // Check if user upvoted
      eventObj.hasUpvoted = event.upvotes.some(
        uid => uid.toString() === userId
      );

      // Check if user RSVPed
      eventObj.hasRsvped = event.rsvps.some(
        rsvp => rsvp.userId?.toString() === userId
      );
    } catch (err) {
      console.warn('Token provided but invalid:', err.message);
      eventObj.hasUpvoted = false;
      eventObj.hasRsvped = false;
      eventObj.isAdmin = false;
    }
  } else {
    eventObj.hasUpvoted = false;
    eventObj.hasRsvped = false;
    eventObj.isAdmin = false;
  }

  res.status(200).json({
    status: 'success',
    event: eventObj,
  });
});



const deleteEvent = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
        return next(new CustomError('Invalid event ID', 400));
    }

    console.log('...deleting event')
    // 1. Delete the event
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
        return next(new CustomError('No event found with this ID', 404));
    }

    // 2. Remove this event ID from each user's events.rsvps array
    const rsvpUserIds = event.rsvps.map(r => r.userId);

    await Promise.all(
        rsvpUserIds.map(userId =>
        User.updateOne(
            { _id: userId },
            { $pull: { 'events.rsvps': id } }
        )
        )
    );

    res.status(200).json({
        status: 'success',
        message: 'Event deleted and removed from user RSVPs',
        event,
    });
});


const createEvents = asyncErrorHandler(async(req, res)=>{
    const data = await req.body;
    const events = await Event.insertMany(data);
    res.status(200).json({
        status:'success',
        events
    })

})


// const getEventsForEventsScreen = asyncErrorHandler(async (req, res, next) => {
//   console.log('hi from get events');
//   const { tags, offset = 0, limit = 10, date } = req.query;
//   const token = req.headers?.token;

//   console.log(token);
//   const { id: userId } = await verifyToken(token);
//   console.log(userId);
//   const user = await User.findById(userId);
//   const isAdmin =
//   user.userRole === 'admin' ||
//   user.userRole === 'co-admin';

//   const tagList = tags ? tags.split(',') : [];

//   console.log('in events screen ');

//   const filter = {};
//   console.log(filter);

//   if (tagList.length > 0) {
//     filter.tags = { $all: tagList };
//   }
//   console.log(filter);

//   if (date) {
//     const startOfDay = new Date(date);
//     const endOfDay = new Date(date);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     filter.date = {
//       $gte: startOfDay,
//       $lte: endOfDay,
//     };
//   }

//   const events = await Event.find(filter)
//     .sort({ date: 1 })
//     .skip(Number(offset))
//     .limit(Number(limit))
//     .select('title tags venue date endDate upvotes rsvps bannerImageUrl rsvpDeadline maxCapacity category');

//   const processedEvents = events.map(event => {
//     const hasUpvoted = event.upvotes?.some(up => up.toString() === userId) || false;
//     const hasRSVPed = event.rsvps?.some(rsvp => rsvp.userId?.toString() === userId) || false;

//     return {
//       _id: event._id,
//       title: event.title,
//       tags: event.tags,
//       bannerImageUrl: event.bannerImageUrl,
//       venue: event.venue,
//       date: event.date,
//       endDate: event.endDate,
//       hasUpvoted,
//       hasRSVPed,
//       totalUpvotes: event.upvotes?.length || 0,
//       totalRSVPs: event.rsvps?.length || 0,
//       rsvpDeadline: event.rsvpDeadline,
//       maxCapacity: event.maxCapacity
//     };
//   });


//   const allEventDates = await Event.aggregate([
//       {
//         $project: {
//           date: 1,
//           title: { $arrayElemAt: ["$tags", 0] }  // rename first tag as "title"
//         }
//       },
//       {
//         $group: {
//           _id: "$date",
//           title: { $first: "$title" },
//           date: { $first: "$date" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           title: 1,
//           date: 1
//         }
//       },
//       {
//         $sort: { date: 1 }
//       }
//     ]);
  
//     // 2. Get RSVP'd events for user (keep original title and date)
//     const user2 = await User.findById(userId).populate({
//       path: 'events.rsvps',
//       select: 'title date'
//     });
  
//     const userRSVPedEvents = user2?.events?.rsvps || [];
//     console.log(userRSVPedEvents);
  
//   res.status(200).json({
//     success: true,
//     events: processedEvents,
//     isAdmin: isAdmin,
//     // we will send dates also here to prevent loading dialog
//     allEventDates,
//     userRSVPedEvents
    
//   });
// });

const getEventsForEventsScreen = asyncErrorHandler(async (req, res, next) => {
  console.log('hi from get events');
  const { tags, offset = 0, limit = 10, date } = req.query;
  const token = req.headers?.token;

  const { id: userId } = await verifyToken(token);
  const user = await User.findById(userId);
  const isAdmin = ['admin', 'co-admin'].includes(user.userRole);

  const tagList = tags ? tags.split(',') : [];
  const filter = {};
  if (tagList.length > 0) {
    filter.tags = { $all: tagList };
  }

  const now = new Date();
  const todayStart = new Date(now.setUTCHours(0, 0, 0, 0));

  // ✅ Upcoming events (today & future) - soonest first
  const upcomingEvents = await Event.find({
    ...filter,
    date: { $gte: todayStart }
  })
    .sort({ date: 1 })
    .select('title tags venue date endDate upvotes rsvps bannerImageUrl rsvpDeadline maxCapacity category');

  // ✅ Completed events (past) - latest first
  const completedEvents = await Event.find({
    ...filter,
    date: { $lt: todayStart }
  })
    .sort({ date: -1 })
    .select('title tags venue date endDate upvotes rsvps bannerImageUrl rsvpDeadline maxCapacity category');

  // Merge without duplicates
  const mergedEvents = [...upcomingEvents, ...completedEvents].map(event => {
    const hasUpvoted = event.upvotes?.some(up => up.toString() === userId) || false;
    const hasRSVPed = event.rsvps?.some(rsvp => rsvp.userId?.toString() === userId) || false;

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
      totalUpvotes: event.upvotes?.length || 0,
      totalRSVPs: event.rsvps?.length || 0,
      rsvpDeadline: event.rsvpDeadline,
      maxCapacity: event.maxCapacity
    };
  });

  // Calendar dates list
  const allEventDates = await Event.aggregate([
    {
      $project: {
        date: 1,
        title: { $arrayElemAt: ["$tags", 0] }
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

  // User RSVP'd events
  const user2 = await User.findById(userId).populate({
    path: 'events.rsvps',
    select: 'title date'
  });
  const userRSVPedEvents = user2?.events?.rsvps || [];

  res.status(200).json({
    success: true,
    events: mergedEvents.slice(Number(offset), Number(offset) + Number(limit)),
    isAdmin,
    allEventDates,
    userRSVPedEvents
  });
});



// const rsvpEvent = asyncErrorHandler(async (req, res, next) => {
//   const token = req.headers.token;
//   if (!token) return next(new CustomError('Token missing', 401));
//   const {id:userId} = await verifyToken(token);
//   const eventId = req.params.id;

//   const user = await User.findById(userId);
//   if (!eventId) return next(new CustomError('No Such event', 400));

//   let event = await Event.findById(eventId);
//   if (!event) return next(new CustomError('Event not found', 404));

//   // ✅ Check if user already RSVPed
//   const alreadyRSVPed = user.events.rsvps.includes(eventId);

//   if (alreadyRSVPed) {
//     console.log(alreadyRSVPed);
//     await Event.findByIdAndUpdate(
//       eventId,
//       { $pull: { rsvps: { userId: userId } } }
//     );
//     await User.findByIdAndUpdate(userId, {
//       $pull: { 'events.rsvps': eventId },
//     });
//   }else{
//     // ✅ Add to event.rsvps
//     event.rsvps.push({ userId });
//     await event.save();

//     // ✅ Add to user.events.rsvps
//     await User.findByIdAndUpdate(userId, {
//       $addToSet: { 'events.rsvps': eventId },
//     });
//   }
//   console.log(!alreadyRSVPed)
//   event = await Event.findById(eventId);
//   res.status(200).json({
//     status: 'success',
//     message: 'RSVP added',
//     hasRSVPed: !alreadyRSVPed,
//     totalRSVPs: event.rsvps.length,
//     userId
//   });
// });

const rsvpEvent = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers.token;
  if (!token) return next(new CustomError('Token missing', 401));

  const { id: userId } = await verifyToken(token);
  const eventId = req.params.id;
  if (!eventId) return next(new CustomError('No such event', 400));

  const user = await User.findById(userId);
  let event = await Event.findById(eventId);
  if (!event) return next(new CustomError('Event not found', 404));

  // ✅ Check if RSVP deadline is passed
  if (event.rsvpDeadline && new Date(event.rsvpDeadline) < new Date()) {
    throw new CustomError('RSVP deadline has passed', 400);
  }

  // ✅ Check if user already RSVPed
  const alreadyRSVPed = user.events.rsvps.includes(eventId);

  // ✅ If not RSVPed yet, check max capacity
  if (!alreadyRSVPed && event.maxCapacity && event.rsvps.length >= event.maxCapacity) {
    throw new CustomError('Event has reached maximum capacity', 400);
  }

  if (alreadyRSVPed) {
    // 🔁 Remove RSVP
    await Event.findByIdAndUpdate(
      eventId,
      { $pull: { rsvps: { userId: userId } } }
    );
    await User.findByIdAndUpdate(userId, {
      $pull: { 'events.rsvps': eventId },
    });
  } else {
    // ➕ Add RSVP
    event.rsvps.push({ userId });
    await event.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'events.rsvps': eventId },
    });
  }

  // Get updated event with RSVP count

  // also we need to send event details(title , date , venue location , attendees) of the rsvped event 
  event = await Event.findById(eventId);

  res.status(200).json({
    status: 'success',
    message: alreadyRSVPed ? 'RSVP removed' : 'RSVP added',
    hasRSVPed: !alreadyRSVPed,
    totalRSVPs: event.rsvps.length,
    event,
    userId,
  });
});




const upvoteEvent = asyncErrorHandler(async (req, res) => {
  const eventId = req.params.id;
  const token = req.headers.token;
  const event = await Event.findById(eventId);

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Token required' });
  }

  const { id: userId } = await verifyToken(token);

  const hasUpvoted = event.upvotes.includes(userId);

  let updatedEvent;
  if (hasUpvoted) {
    // Remove upvote
    updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { upvotes: userId } },
      { new: true }
    );
  } else {
    // Add upvote
    updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { upvotes: userId } },
      { new: true }
    );
  }

  if (!updatedEvent) {
    return res.status(404).json({ status: 'fail', message: 'Event not found' });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Upvote recorded successfully',
    totalUpvotes: updatedEvent.upvotes.length,
    hasUpvoted : !hasUpvoted
  });
});


const markAttendance = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers.token;
  const { id: adminId } = await verifyToken(token);
  console.log( 'hi',req.body);
  const { eventId , userId } = req.body;
  console.log(adminId)

  // Fetch admin
  const admin = await User.findById(adminId);
  if (!admin) {
    return next(new CustomError('Unauthorized: Admin not found', 401));
  }

  // Check admin role
  const isAdmin =
    admin.userRole === 'admin' ||
    admin.userRole === 'co-admin';

  if (!isAdmin) {
    return next(new CustomError('Unauthorized to mark attendance', 403));
  }

  // Fetch user and event
  const user = await User.findById(userId);
  if (!user) return next(new CustomError('User not found', 404));

  const event = await Event.findById(eventId);
  if (!event) return next(new CustomError('Event not found', 404));

  // Prevent duplicate attendance
  const alreadyMarked = user.events.attended.includes(eventId);
  if (alreadyMarked) {
    return res.status(200).json({ success: true, message: 'Already marked as attended' });
  }

  // Add to User's attended list
  user.events.attended.push(event._id);
  await user.save();

  // Add to Event's QR Check-in list
  event.qrCheckIns.push({
    userId: user._id,
    checkedInAt: new Date()
  });
  await event.save();

  return res.status(200).json({
    success: true,
    message: 'Attendance marked successfully',
    data: {
      userId: user._id,
      eventId: event._id
    }
  });
});



const attendanceStats = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return next(new CustomError('Authorization failed. Please login.', 401));
  }

  const { id: userId } = await verifyToken(token);

  // ✅ Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new CustomError('Invalid user ID from token', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new CustomError('User not found', 404));
  }

  const rsvpEvents = await Event.find({
    rsvps: { $elemMatch: { userId: userId } },
  }).select('bannerImageUrl title date endDate category qrCheckIns');

  // ✅ Safer comparison using `toString()`
  const attendedEvents = rsvpEvents.filter(event =>
    (event.qrCheckIns ?? []).some(checkIn =>
      checkIn.userId?.toString() === userId.toString()
    )
  );

  res.status(200).json({
    success: true,
    totalRSVPs: rsvpEvents.length,
    totalAttended: attendedEvents.length,
    rsvpEvents,
    attendedEvents,
  });
});





module.exports = {
    createEvent , getAllEvents , getEvent , deleteEvent , createEvents , rsvpEvent , getEventsForEventsScreen , upvoteEvent , updateEvent ,markAttendance , attendanceStats
}