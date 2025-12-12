const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// GET /file?filename=yourfile.jpg
router.get("/file", fileController.getFileDestination);

module.exports = router;
