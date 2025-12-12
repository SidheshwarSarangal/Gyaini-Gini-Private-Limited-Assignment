const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db/database");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = new Date()
      .toISOString() // 2025-12-09T16:57:04.123Z
      .replace("T", "_") // 2025-12-09_16:57:04.123Z
      .replace("Z", "") // remove Z
      .replace(/\..+/, "") // remove milliseconds
      .replace(/:/g, "-"); // replace : with -

    const cleanName = file.originalname.replace(/\s+/g, "_"); // optional: replace spaces
    const newName = `${cleanName}`;
    cb(null, newName);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("files", 20), (req, res) => {
  const cleanFiles = req.files.map((f) => ({
    destination: f.destination,
    filename: f.filename,
    fieldname: f.fieldname,
    encoding: f.encoding,
    size: f.size,
  }));

  const processedFiles = []; // <--- declare this

  const checkAndInsert = (file, callback) => {
    db.get(
      `SELECT * FROM uploads WHERE 
         destination = ? AND filename = ? AND fieldname = ? AND encoding = ? AND size = ?`,
      [
        file.destination,
        file.filename,
        file.fieldname,
        file.encoding,
        file.size,
      ],
      (err, row) => {
        if (err) return callback(err);

        if (!row) {
          db.run(
            `INSERT INTO uploads (destination, filename, fieldname, encoding, size)
                     VALUES (?, ?, ?, ?, ?)`,
            [
              file.destination,
              file.filename,
              file.fieldname,
              file.encoding,
              file.size,
            ],
            function (err2) {
              if (err2) return callback(err2);
              processedFiles.push({
                id: this.lastID, // new id
                ...file,
                status: "new",
              });
              callback();
            }
          );
        } else {
          processedFiles.push({
            ...row,
            status: "existing",
          });
          callback();
        }
      }
    );
  };

  let index = 0;
  const processNext = () => {
    if (index < cleanFiles.length) {
      checkAndInsert(cleanFiles[index], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        index++;
        processNext();
      });
    } else {
      res.json({ message: "Upload complete", files: processedFiles });
    }
  };

  processNext();
});

module.exports = router;
