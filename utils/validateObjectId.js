const validateObjectId = (req, res, next) => {
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      next();
    // return res.status(400).json({ message: 'Invalid ObjectId' });
  }

};

module.exports = validateObjectId;