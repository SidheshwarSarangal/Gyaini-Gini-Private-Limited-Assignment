const db = require("../db/database");
const tesseract = require("./tesseractController");
const yolo = require("./yoloController");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// --- Clean OCR output ---
function cleanText(text) {
  if (!text) return "";
  let cleaned = text.replace(/\n+/g, " ");           // remove newlines
  cleaned = cleaned.replace(/\s+/g, " ").trim();    // remove extra spaces
  cleaned = cleaned.replace(/[^\w\s,.]/g, "");      // remove special characters
  return cleaned;
}

// --- Save result to DB ---
const saveResultToDB = (destination, filename, modelName, text, confidence) => {
  if (!text.trim()) return;
  db.get(
    `SELECT * FROM records WHERE destination=? AND filename=? AND model=? AND ocr_text=? AND confidence=?`,
    [destination, filename, modelName, text, confidence],
    (err, row) => {
      if (err) return console.error(`${modelName} DB select error:`, err.message);
      if (!row) {
        db.run(
          `INSERT INTO records (destination, filename, model, ocr_text, confidence) VALUES (?,?,?,?,?)`,
          [destination, filename, modelName, text, confidence],
          (err2) =>
            err2
              ? console.error(`${modelName} DB insert error:`, err2.message)
              : console.log(`${modelName} inserted successfully`)
        );
      } else {
        console.log(`${modelName} record already exists → skipping insert`);
      }
    }
  );
};

// --- Try OCR model ---
const tryModel = async (modelName, ocrFunc, imagePath) => {
  try {
    // Preprocess image for better OCR
    const preprocessedBuffer = await sharp(imagePath)
      .grayscale()
      .normalise()
      .sharpen()
      .threshold(150)
      .toBuffer();

    const result = await ocrFunc(preprocessedBuffer);
    const text = result.text || "";
    const confidence = result.confidence || 0;
    if (text.trim()) {
      saveResultToDB(result.destination || "", result.filename || "", modelName, text, confidence);
      return { destination: result.destination || "", filename: result.filename || "", model: modelName, text, confidence };
    }
  } catch (err) {
    console.log(`${modelName} failed:`, err.message);
  }
  return null;
};

// --- Main pipeline ---
exports.runPipeline = async (req, res) => {
  const { filePath, destination, filename } = req.body;
  if (!filePath) return res.status(400).json({ message: "filePath is required" });

  let result = null;
  try {
    const boxes = await yolo.detectObjects(filePath);

    if (boxes.length > 0) {
      console.log(`YOLO detected ${boxes.length} object(s)`);

      // Use first box for OCR
      const box = boxes[0];
      const croppedPath = path.join(
        path.dirname(filePath),
        `${path.basename(filePath, path.extname(filePath))}_crop.png`
      );

      await sharp(filePath)
        .extract({
          left: Math.floor(box.x),
          top: Math.floor(box.y),
          width: Math.floor(box.w),
          height: Math.floor(box.h),
        })
        .toFile(croppedPath);

      result = await tryModel("Tesseract+YOLO", tesseract.run, croppedPath);

    } else {
      console.log("YOLO did not detect any objects, splitting image into grid for OCR");

      const meta = await sharp(filePath).metadata();
      const rows = 3;
      const cols = 3;
      const cellWidth = Math.floor(meta.width / cols);
      const cellHeight = Math.floor(meta.height / rows);

      let combinedText = "";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cropPath = path.join(
            path.dirname(filePath),
            `${path.basename(filePath, path.extname(filePath))}_grid_${r}_${c}.png`
          );

          await sharp(filePath)
            .extract({
              left: c * cellWidth,
              top: r * cellHeight,
              width: cellWidth,
              height: cellHeight,
            })
            .toFile(cropPath);

          const partial = await tryModel("Tesseract", tesseract.run, cropPath);
          if (partial && partial.text) combinedText += cleanText(partial.text) + " ";
        }
      }

      combinedText = combinedText.trim();

      if (combinedText) {
        result = { destination, filename, model: "Tesseract-grid", text: combinedText, confidence: 0 };
      } else {
        result = await tryModel("Tesseract", tesseract.run, filePath);
      }
    }

  } catch (err) {
    console.log("YOLO failed:", err.message);
    result = await tryModel("Tesseract", tesseract.run, filePath);
  }

  if (!result) {
    result = { destination, filename, model: "None", text: "", confidence: 0, message: "All OCR models failed" };
  }

  res.json(result);
};
