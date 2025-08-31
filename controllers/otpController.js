const Otp = require('../models/otpModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const getAllOpts = asyncErrorHandler(async(req , res)=>{
    const data = await Otp.find({});
    res.json({
        data
    })
})

module.exports = {
    getAllOpts
}