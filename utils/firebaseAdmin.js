// const admin = require('firebase-admin');
// const serviceAccount = require('./config/yi-whats-on-firebase-adminsdk-fbsvc-2242d46944.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;


require('dotenv').config(); // <- must be first

const admin = require('firebase-admin');

const serviceAccountJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_B64;
if (!serviceAccountJSON) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS_B64 is not defined');
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountJSON, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
