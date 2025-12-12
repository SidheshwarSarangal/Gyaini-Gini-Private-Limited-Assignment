const express = require("express");
const app = express();
const multer = require("multer");
const PORT = 3000;
const path = require("path");


// Middleware
app.use(express.json());

// Routes
const recordsRoutes = require("./routes/records");
app.use("/", recordsRoutes);
const uploadRoutes = require("./routes/upload");
app.use("/", uploadRoutes);
const pipelineRoutes = require("./routes/ocrPipeline");
app.use("/", pipelineRoutes);
const fileRoutes = require("./routes/file");
app.use("/", fileRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Test route
app.get("/", (req, res) => {
    res.send("Server is running with database integration!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));