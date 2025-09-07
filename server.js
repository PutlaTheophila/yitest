console.log('hi');
const mongoose = require('mongoose');
const app = require('./app.js');
const { cleanIndexes } = require('./models/userModel.js');
const { get } = require('request');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URL).then(() => {
  console.log('connected to DB');
  app.listen(6969,'0.0.0.0',()=>{
      console.log(`app is listening on port ${process.env.PORT}`);
  })
  // app.listen(process.env.PORT, () => {
  //   console.log(`app is listening on port ${process.env.PORT}`);
  // });
});

