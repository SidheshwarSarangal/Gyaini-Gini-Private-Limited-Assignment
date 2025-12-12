const express = require("express");
const router = express.Router();
const pipelineController = require("../controllers/ocrPipelineController");

router.post("/pipeline", pipelineController.runPipeline);

module.exports = router;
