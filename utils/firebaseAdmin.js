const admin = require('firebase-admin');
const serviceAccount = require('./config/yi-whats-on-firebase-adminsdk-fbsvc-2242d46944.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
