const db = require("../db/database");

exports.getFileDestination = (req, res) => {
    const { filename } = req.query; // expect ?filename=yourfile.jpg
    if (!filename) {
        return res.status(400).json({ error: "filename is required" });
    }

    const query = `SELECT destination, filename FROM uploads WHERE filename = ? LIMIT 1`;

    db.get(query, [filename], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!row) {
            return res.status(404).json({ message: "File not found" });
        }

        res.json({ destination: row.destination, filename: row.filename });
    });
};
