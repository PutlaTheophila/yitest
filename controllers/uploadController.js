const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

// controllers/uploadController.js
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided.' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
};

module.exports = { uploadImage };
