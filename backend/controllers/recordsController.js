const db = require("../db/database");
const path = require("path");
const fs = require("fs");


// Add a new record
exports.addRecord = (req, res) => {
    const { filename, ocr_text, confidence } = req.body;

    db.run(
        "INSERT INTO records (filename, ocr_text, confidence) VALUES (?, ?, ?)",
        [filename, ocr_text, confidence],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Record added", id: this.lastID });
        }
    );
};

// Get all records
// Get all records
exports.getAllRecords = (req, res) => {
    db.all("SELECT * FROM records ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });

        // Transform rows to match the frontend format
        const formatted = rows.map(row => ({
            id: row.id,
            filename: row.filename,
            destination: row.destination,
            model: row.model,
            confidence: row.confidence,
            text: row.ocr_text,              // rename
            imageUrl: `/uploads/${row.filename}`,  // add path
            created_at: row.created_at
        }));

        res.json(formatted);
    });
};


// Get single record by ID
exports.getRecordById = (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM records WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Record not found" });
        res.json(row);
    });
};

// DELETE A RECORD
exports.deleteRecord = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM records WHERE id = ?", [id], (err, record) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!record) return res.status(404).json({ message: "Record not found" });

        db.run("DELETE FROM records WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Delete file from uploads folder
            const filePath = path.join(__dirname, "..", "uploads", record.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            res.json({ message: "Record deleted successfully" });
        });
    });
};