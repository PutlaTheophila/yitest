const CustomError = require("../utils/customError.js");
const mongoose = require("mongoose");
const User = require('../models/userModel.js');
const Event = require('../models/eventModel.js');
const asyncErrorHandler = require('../utils/asyncErrorHandler.js');
const { verifyToken, createToken } = require("../utils/jwt.js");
require('dotenv').config;


const parseIfString = (val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return [];
    }
  }
  return val;
};

const createUser = asyncErrorHandler(async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    let parsedData = {
    name: body.name,
    mobile: body.mobile,
    dateOfBirth: new Date(body.dateOfBirth),
    industry : parseIfString(req.body.industry),
    interestAreas : parseIfString(req.body.interestAreas),
    yiRole: body.yiRole || 'Member',                  
    yiTeam: body.yiTeam || 'not-specified',                         
    // yiInitiatives: body.yiInitiatives|| "not-specified"  ,
    yiInitiatives: parseIfString(body.yiInitiatives) ,
    yearOfJoining : body.yearOfJoining || "not-specified"
    };

    console.log(parsedData);
    // 🖼 If using multer with image upload
    if (req.file) {
        parsedData = {...parsedData , profilePhotoUrl : req.file.path};
        console.log(req.file.path); // or full path if you're storing URLs
    }

    const user = await User.create(parsedData);

    const token = await createToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data:user
    });
  } catch (error) {
    next(error); // will hit your global error handler
  }
});


const getUser = asyncErrorHandler(async (req  , res , next)=>{    
    const id = req.params.id;
    const user = await User.find({_id:id});
    res.status(200).json({
        status:'sucess',
        data:{
            user
        }
    })
})

const userProfile = asyncErrorHandler(async(req , res , next)=>{
     console.log(req.headers.token);
    const token = req.headers.token;
    if(!token){
      next (new CustomError('Please login' , 404))
    }
    const data =  await verifyToken(token);
    console.log(data);
    console.log('user data',data.id);
    if(!token) next(new CustomError('un-authorized please login' , 404));
    const user = await User.findOne({_id:data.id});
    // await new Promise(res => setTimeout(res, 1000));
    user.rsvpCount = user.events.rsvps.length;
    user.attendedCount = user.events.attended.length;
    console.log(user);
    res.status(200).json({        
        status:'sucess',
        data:{
            user
        }
    })
})


const updateUser = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers?.token;
  if (!token) return next(new AppError('Unauthorized: No token provided', 401));

  const { id: userId } = await verifyToken(token);
  if (!userId) return next(new AppError('Invalid token', 401));

  // Full body logging for debugging
  console.log('🔥 Raw body:', req.body);

  const updates = {
    name: req.body.name,
    dateOfBirth: req.body.dob,
    industry: JSON.parse(req.body.industries),
    interestAreas: JSON.parse(req.body.interests),
    yiTeam : req.body.yiTeam,
    // yiInitiatives : req.body.yiInitiative,
    yiInitiatives : JSON.parse(req.body.yiInitiatives),
    yiRole : req.body.yiRole,
    yearOfJoining :req.body.yearOfJoining,
  };
  if (req.file) {
    updates.profilePhotoUrl = req.file.path;
  }

  console.log('✅ Final updates to apply:', updates);

  if (!Array.isArray(updates.industry) || updates.industry.length === 0) {
    return next(new AppError('At least one industry must be selected', 400));
  }
  if (!Array.isArray(updates.interestAreas) || updates.interestAreas.length === 0) {
    return next(new AppError('At least one interest must be selected', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return next(new CustomError('User not found', 404));

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});


const updateUserPermissions = async (req, res, next) => {
      // await new Promise(res => setTimeout(res, 3000));
  try {
    // const userIdToUpdate = req.headers.id; // the user we want to update
    const updates = req.body;
    console.log(req.body);
    const token = req.headers.token;

    // Verify the token
    const verifiedData = await verifyToken(token);
    const requestingUser = await User.findById(verifiedData.id);

    // Ensure the requesting user exists and has the right role
    if (!requestingUser || !(requestingUser.userRole === 'admin' || requestingUser.userRole === 'co-admin')) {
      return next(new CustomError('Not authenticated or not authorized', 403));
    }

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(req.body.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });

  } catch (err) {
    console.error('Update failed:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const token = req.headers.token
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const {id:userId} = await verifyToken(token);
  const user = await User.findById(userId);
  isAdmin = false;
  if(user){
    if(user.userRole == 'admin' || user.userRole == 'co-admin'){
        isAdmin = true;
    }
  }
  const users = await User.find({}).skip(skip).limit(limit);
  res.status(200).json({
    status: "success",
    data: users,
    admin:isAdmin
  });
});

// for deleting user in the members screen
const deleteUser = asyncErrorHandler(async (req, res, next) => {
  const id = req.headers.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new CustomError('Invalid user ID format', 400));
  }
    // await new Promise(res => setTimeout(res, 3000));
  console.log('Deleting user ID:', id);

  // First check if user exists
  const userExists = await User.findById(id);
  if (!userExists) {
    return next(new CustomError('User not found', 404));
  }

  // Then delete
  await User.findByIdAndDelete(id);

  // Clean up Event references
  await Event.updateMany({ upvotes: id }, { $pull: { upvotes: id } });
  await Event.updateMany({ 'rsvps.userId': id }, { $pull: { rsvps: { userId: id } } });
  await Event.updateMany({ 'qrCheckIns.userId': id }, { $pull: { qrCheckIns: { userId: id } } });

  res.status(200).json({
    status: 'success',
    message: 'User deleted and references removed from events',
  });
});


const deleteUserByUser = asyncErrorHandler(async(req,res,next)=>{
  const token = req.headers.token;
  if(!token){
    return next(new CustomError('User not logged in' , 404));
  }
  const {id:userId} = await verifyToken(token);
  const user = await User.findById(userId);
  if(!user) return next(new CustomError('User not found' , 404))
  await User.findByIdAndDelete(userId);
  res.status(200).json({
    status:'success',
    user
  })
})

const updateUserProfile = asyncErrorHandler(async(req, res)=>{
    const data = req.body;
    const body = req.body;
    console.log(body);
    const token = req.headers.token;
    console.log('token: ',token);
    const {id:userId} = await verifyToken(token);
    // console.log(await verifyToken(token));
    // console.log('id is ', userId);
    let parsedData = {
        yiRole: body.yiRole || 'Member',                  
        yiTeam: body.yiTeam || 'NA',                  
        // yiMytri: body.yiMytri || 'NA',              
        // yiProjects: body.yiProjects || 'NA',         
        yiInitiatives: body.yiInitiatives|| "NA" ,
        // userRole : 'admin'
    }

    if(req.file){
       parsedData =  {...parsedData , profilePhotoUrl:req.file.path}
    }
    console.log(parsedData);
    await User.findByIdAndUpdate(userId, parsedData);
    const user = await User.findByIdAndUpdate(userId);
    res.status(200).json({
        status:'success',
        user
    })
})

module.exports = {
    createUser,
    getUser,
    getAllUsers,
    deleteUser,
    userProfile,
    updateUser,
    updateUserProfile,
    updateUserPermissions,
    deleteUserByUser
}