const express = require("express");
const router = express.Router();
const recordsController = require("../controllers/recordsController");

// Routes
router.post("/add-record", recordsController.addRecord);
router.get("/records", recordsController.getAllRecords);
router.get("/records/:id", recordsController.getRecordById);
router.delete("/records/:id", recordsController.deleteRecord);

module.exports = router;
