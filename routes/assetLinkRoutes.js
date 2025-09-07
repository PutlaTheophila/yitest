// routes/assetlinksRoutes.js
const express = require("express");
const router = express.Router();
const { getAssetLinks } = require("../controllers/assetLinkController.js");

// Must be served exactly at /.well-known/assetlinks.json
router.get("/.well-known/assetlinks.json", getAssetLinks);

module.exports = router;
