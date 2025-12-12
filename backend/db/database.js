const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (or create if it doesn't exist)
const db = new sqlite3.Database("db.sqlite", (err) => {
    if (err) console.error("DB connection error:", err.message);
    else console.log("Connected to SQLite database");
});

// Create OCR records table
db.run(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT,
    filename TEXT,
    model TEXT,
    ocr_text TEXT,
    confidence REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create uploads table
db.run(`
  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT,
    filename TEXT,
    fieldname TEXT,
    encoding TEXT,
    size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
