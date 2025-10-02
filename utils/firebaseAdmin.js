// const admin = require('firebase-admin');
// const serviceAccount = require('./config/yi-whats-on-firebase-adminsdk-fbsvc-2242d46944.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;



const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

// Path where we'll temporarily write the secret inside the container
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Write the Firebase JSON from the environment variable at runtime
fs.writeFileSync(serviceAccountPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Load the service account from the temporary file
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
