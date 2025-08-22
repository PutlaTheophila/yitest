const User = require('../models/userModel.js');
const Event = require('../models/eventModel.js');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
exports.getAdminStats = asyncErrorHandler(async (req, res) => {
  const now = new Date();
  console.log('in admin stats');

  // Execute all MongoDB operations in parallel
  const [
    totalUsers,
    upcomingEvents,
    completedEvents,
    roleCountAgg,
    adminCountAgg,
    ecMembers,
    chairs,
    admins,
    coAdmins
  ] = await Promise.all([
    User.countDocuments({}),
    Event.countDocuments({ date: { $gte: now } }),
    Event.countDocuments({ endDate: { $lte: now } }),
    User.aggregate([{ $group: { _id: "$yiRole", count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: "$userRole", count: { $sum: 1 } } }]),
    User.find({ yiRole: 'EC' }).select('name mobile yiTeam  yiInitiatives '),
    User.find({ yiRole: 'Chair' }).select('name mobile yiTeam  yiInitiatives '),
    User.find({ yiRole: 'EC-Chair' }).select('name mobile yiTeam  yiInitiatives '),
    User.find({ yiRole: 'EC-CoChair' }).select('name mobile yiTeam  yiInitiatives '),
    User.find({ yiRole: 'Steering Committee' }).select('name mobile yiTeam  yiInitiatives '),
    User.find({ userRole: 'admin' }).select('name mobile yiTeam  yiInitiatives '),
    User.find({ userRole: 'co-admin' }).select('name mobile yiTeam  yiInitiatives '),
  ]);

  // Helper to extract count by role
  const mapCount = (list, key) => {
    const found = list.find((r) => r._id === key);
    return found ? found.count : 0;
  };

  const ecCount = mapCount(roleCountAgg, 'EC');
  const chairCount = mapCount(roleCountAgg, 'Chair');
  const ECChairCount = mapCount(roleCountAgg, 'EC-Chair');
  const ECCoChairCount = mapCount(roleCountAgg, 'EC-CoChair');
  const SteeringCommitteeCount  = mapCount(roleCountAgg, 'Steering Committee');
  const adminCount = mapCount(adminCountAgg, 'admin');

  res.status(200).json({
    totalUsers,
    upcomingEvents,
    completedEvents,
    ecCount,
    chairCount,
    adminCount,
    ECChairCount,
    ECCoChairCount,
    ecMembers,
    SteeringCommitteeCount,
    chairs,
    admins,
    coAdmins
  });
});



// Fetch all users with filters (for table display)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err });
  }
};

// Update a user's role or fields
exports.updateUser = async (req, res) => {
    console.log('updatinf');
  try {
    const { userId } = req.params;
    const updateFields = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err });
  }
};

// Delete a user (soft delete recommended)
exports.deleteUser = async (req, res) => {
    console.log('deleting');
  try {
    const { userId } = req.params;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.log('hi',err);
    res.status(500).json({ message: "Delete failed", error: err });
  }
};

// Fetch all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err });
  }
};

// Update event (admin use)
// exports.updateEvent = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });

//     if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

//     res.json(updatedEvent);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update event", error: err });
//   }
// };

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const deleted = await Event.findByIdAndDelete(eventId);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err });
  }
};
