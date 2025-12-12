const db = require("../db/database");
const tesseract = require("./tesseractController");
const sharp = require("sharp");

// Clean OCR output
function cleanText(text) {
  if (!text) return "";
  return text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

// Save result to DB
function saveResultToDB(destination, filename, text, confidence) {
  if (!text.trim()) return;
  db.get(
    `SELECT * FROM records WHERE destination=? AND filename=? AND ocr_text=? AND confidence=?`,
    [destination, filename, text, confidence],
    (err, row) => {
      if (err) return console.error("DB select error:", err.message);
      if (!row) {
        db.run(
          `INSERT INTO records (destination, filename, ocr_text, confidence) VALUES (?,?,?,?)`,
          [destination, filename, text, confidence],
          (err2) => err2
            ? console.error("DB insert error:", err2.message)
            : console.log("OCR result saved")
        );
      }
    }
  );
}

// OCR processing
async function tryOCR(imagePath) {
  try {
    const preprocessed = await sharp(imagePath)
      .grayscale()
      .normalise()
      .sharpen()
      .threshold(150)
      .toBuffer();

    const result = await tesseract.recognize(preprocessed);
    return { text: cleanText(result.text), confidence: result.confidence };
  } catch (err) {
    console.error("OCR failed:", err.message);
    return { text: "", confidence: 0 };
  }
}

// Main pipeline endpoint
exports.runPipeline = async (req, res) => {
  const { filePath, destination, filename } = req.body;
  if (!filePath) return res.status(400).json({ message: "filePath is required" });

  const ocrResult = await tryOCR(filePath);

  if (ocrResult.text) {
    saveResultToDB(destination || "", filename || "", ocrResult.text, ocrResult.confidence);
  }

  res.json({
    destination,
    filename,
    model: "Tesseract",
    text: ocrResult.text,
    confidence: ocrResult.confidence
  });
};
