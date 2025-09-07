
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { verifyToken } = require('../utils/jwt');
const Notification = require('../models/notificationModel.js');
const Coupon = require('../models/couponModel.js');

const sendData = asyncErrorHandler(async (req, res) => {
  const token = req.headers.token;
  const { id: userId } = await verifyToken(token);
  const user = await User.findById(userId).lean();
  // const userId = '68b05071a46e1fe534096bc5';
  // const user = await User.findById('68b05071a46e1fe534096bc5').lean();

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }
  // const now = new Date(new Date().toISOString());
  const userName = user.name?.split(' ')[0] || '';
  const userProfile = user.profilePhotoUrl;
  const now = new Date();
  // 🔔 Unread notifications count
  const unreadNotificationsCount = await Notification.countDocuments({
    userId,
    read: false,
  });
  // 🟡 STEP 1: Fetch RSVP-ed events
  const rsvpEventIds = user.events?.rsvps || [];
  let rsvpEvents = [];
  if (rsvpEventIds.length > 0) {
    rsvpEvents = await Event.find({
      date: { $gte: now },
      _id: { $in: rsvpEventIds },
    })
      .sort({ date: 1 }) // Closest upcoming first
      .limit(3)
      .lean();
  }
  // 🟡 STEP 2: If less than 5, fetch top upcoming events to fill the rest
  let extraEvents = [];
  if (rsvpEvents.length < 3) {
    const excludeIds = rsvpEvents.map((e) => e._id);

    extraEvents = await Event.find({
      _id: { $nin: excludeIds },
      date: { $gte: now },
    })
      .sort({ date: 1 }) // Closest upcoming
      .limit(5 - rsvpEvents.length)
      .lean();
  }

  const selectedEvents = [...rsvpEvents, ...extraEvents];

  // 🟡 STEP 3: Format events
  const events = selectedEvents.map((event) => {
    const hasUpvoted = event.upvotes?.some(
      (up) => up.toString() === userId
    ) || false;

    const hasRSVPed = event.rsvps?.some(
      (rsvp) => rsvp.userId?.toString() === userId
    ) || false;

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
      maxCapacity: event.maxCapacity,
      category: event.category,
    };
  });

  // 🟡 STEP 4: Trending tags aggregation
    const eventStats = await Event.aggregate([
    {
      $match: {
        date: { $gt: now },
      },
    },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        eventCount: { $sum: 1 },
        rsvpCount: {
          $sum: {
            $cond: [{ $isArray: "$rsvps" }, { $size: "$rsvps" }, 0],
          },
        },
      },
    },
    { $sort: { rsvpCount: -1 } },
    { $limit: 4 },
    {
      $project: {
        _id: 0,
        tag: "$_id",
        rsvpCount: 1,
        eventCount: 1,
      },
    },
  ]);

    // 🟡 STEP 5: Latest 5 coupons (based on createdAt)
  const coupons = await Coupon.find({})
    .sort({ createdAt: -1 }) // Most recent first
    .limit(5)
    .lean();

  const allEvents = await Event.find({});
  const totalUsers = (await User.find({})).length;  // ✅ Remove ()
  const eventCount = allEvents.length; 

  // 🟡 STEP 6: Calculate total RSVPs and Upvotes across all events
  const totalRSVPs = allEvents.reduce((acc, event) => acc + (event.rsvps?.length || 0), 0);
  const totalUpvotes = allEvents.reduce((acc, event) => acc + (event.upvotes?.length || 0), 0);
  const offers = await Coupon.find({});
  const totalOffers = offers.length;

    // 🟡 STEP 7: Birthday Users (born today)
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
          yearOfJoining:1
        },
      },
    ]);
  
  return res.status(200).json({
    status: 'success',
    data: {
      userName,
      userProfile,
      events, // ✅ always exactly 5 events
      eventStats,
      unreadNotificationsCount,
      coupons,
      eventCount,
      totalUsers,
      totalRSVPs,
      totalOffers,
      birthdayUsers
    },
  });

});


// 68b05071a46e1fe534096bc5
//palash id 


const test = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    status:'success',
    users
  })
}

module.exports = { sendData , test };
