const express = require("express");
const userRouter = express.Router();
const {createUser, getAllUsers, getUser, deleteUser , userProfile, updateUser, updateUserProfile, updateUserPermissions , createUsers , deleteUserByUser} = require("../controllers/userController.js");
const { protect } = require('../utils/jwt.js')
const upload = require('../mw/cloudinaryMiddleware.js');

userRouter.route('/')
    .post(upload.single('profilePhoto'),createUser)
    .get(getAllUsers)


userRouter.route('/profile')
    .get(userProfile)
    .patch(upload.single('profilePhoto'),updateUserProfile)
    .delete(deleteUserByUser)

userRouter.route('/permissions/:id')
    .patch(updateUserPermissions)

userRouter.route('/:id')
    .get(getUser)
    .delete(deleteUser)



// this is route where user edits his own profile 
userRouter.route('/editprofile')
    .patch(upload.single('profilePhoto'),updateUser)

module.exports = userRouter;

