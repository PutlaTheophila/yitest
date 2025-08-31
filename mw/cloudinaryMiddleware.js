// // middleware/cloudinaryUpload.js
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../config/cloudinaryConfig.js');

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'event-images',
//     allowed_formats: ['jpg', 'png' , 'jpeg'],
//     // transformation: [{ width: 800, height: 600, crop: 'limit' }],
//   },
// });

// const upload = multer({ storage });
// module.exports = upload;



// middleware/cloudinaryUpload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig.js');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'event-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      {
        quality: 'auto:eco',     // Light compression with good visual quality
        fetch_format: 'auto',    // Delivers modern formats like WebP/AVIF when supported
      }
    ],
  },
});

const upload = multer({ storage });
module.exports = upload;
