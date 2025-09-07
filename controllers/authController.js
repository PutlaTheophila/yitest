const Otp = require('../models/otpModel.js');
const User = require('../models/userModel.js');
const CustomError = require('../utils/customError.js');
const { createToken } = require('../utils/jwt.js'); // Optional integration
require('dotenv').config();
var request = require('request');
const {validateUserForOTP} = require('../utils/mobile_validator.js')
// twilio requirements
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken );

let accessToken = null;          // ✅ Declare it here
let tokenExpiresAt = null;  

const getValidAccessToken = async () => {
  if (accessToken && tokenExpiresAt && tokenExpiresAt > new Date()) {
    return accessToken;
  }

  const customerId = process.env.OTP_CUSTOMER_ID;
  const base64Key = process.env.OTP_BASE64_KEY;

  if (!customerId || !base64Key) {
    throw new Error('OTP credentials are missing! Check .env');
  }

  const tokenUrl = `https://cpaas.messagecentral.com/auth/v1/authentication/token?customerId=${customerId}&key=${base64Key}&scope=NEW&country=91`;


  const sendResponse = await fetch(tokenUrl, {
    method: 'GET',
    url:tokenUrl,
    headers:{
      'accept': '*/*'
    }
  });

  const data = await sendResponse.json();
  // console.log(data);

  // this log has to be removed
  // console.log(sendResponse);
  accessToken = data.token;
  tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 5 * 60 * 1000); // 7 days - 5 minutes
  return accessToken;
};

//send otp
exports.sendOtp = async (req, res , next) => {
  try {
    const { mobile } = req.body;
    console.log(validateUserForOTP(mobile));
    if(!validateUserForOTP(mobile)){
      console.log(!validateUserForOTP(mobile));
      return next(new CustomError('Unauthorized to login', 404));
    }
    if (!mobile) {
      return next(new CustomError('Mobile Number is required', 500));
    }
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.deleteMany({ mobile });
    const token = await getValidAccessToken();
    console.log(token);
    const mobileNumber = mobile.toString();
    console.log(mobileNumber);
    if(mobileNumber == process.env.TESTING_NUMBER ){
       return res.status(200).json({
      success: true,
      message: 'testing number detected',
      mobile,
    });
    }
    const sendOtpUrl = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&flowType=SMS&mobileNumber=${mobileNumber}&authToken=${token}&otpLength=6`;

    const sendResponse = await fetch(sendOtpUrl, {
      method: 'POST',
      headers: { authToken: token },
    });

    console.log(sendResponse);

    if (!sendResponse.ok) {
      const errText = await sendResponse.text();
      console.error('Failed to send OTP:', errText);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    console.log(sendResponse);

    const sendData = await sendResponse.json();
    console.log('OTP sent response:', sendData);


    await Otp.create({
     verificationId : sendData.data?.verificationId,
     mobile : sendData.data?.mobileNumber,
     expiresAt : expiresAt
    })

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      mobile,
      verificationId: sendData.data.verificationId,
    });
  } catch (err) {
    console.error('❌ Error in sendOtp:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};


exports.verifyOtp = async (req, res , next) => {
    const { mobile, code } = req.body;
    console.log('hi from verify otp',req.body);
    let token , existingUser;
    let user = await User.findOne({ mobile : mobile });
    console.log( 'hi', user);
    if (user) {
      token = createToken(user?._id ) ;
      console.log(token);
      existingUser= true;
    }
    if(!user){
      existingUser = false;
    }
    if(mobile == process.env.TESTING_NUMBER){
      if(code == process.env.TESTING_OTP){
        return res.status(200).json({
          status:'success',
          existingUser,
          token : token
        })
      }else{
        return res.status(500).json({
          status:'failure',
          message :'invalid otp'
        })
      }
    }
    const otpDoc = await Otp.findOne({mobile });
    if(!otpDoc){
      return next(new CustomError('OTP expired ', 500));
    }
    console.log(otpDoc);
    const verifyOtpUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp?&verificationId=${otpDoc.verificationId}&code=${code}`;


    const otpToken = await getValidAccessToken();
    const sendResponse = await fetch(verifyOtpUrl, {
      method: 'GET',
      headers: { authToken: otpToken },
    });

    const result = await sendResponse.json();
    console.log(result);

    if (result.responseCode !== 200) {
      console.error('Invalid OTP:', result.message);
      return next ( new CustomError ('Invalid OTP', 500));
    }
    console.log(existingUser , token);
    res.status(200).json({
      status:'success',
      token : token,
      existingUser
    })
  };