const ort = require("onnxruntime-node");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const MODEL_PATH = path.join(__dirname, "../models/yolov5s.onnx");
const CONF_THRESH = 0.2;   // lower to catch faint objects
const IOU_THRESH = 0.3;    // stricter NMS

// --- Non-Max Suppression ---
function nonMaxSuppression(boxes, iouThreshold) {
  if (!boxes.length) return [];
  boxes.sort((a, b) => b.confidence - a.confidence);
  const picked = [];

  while (boxes.length) {
    const a = boxes.shift();
    picked.push(a);
    boxes = boxes.filter(b => {
      const interArea = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
                        Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      const unionArea = a.w * a.h + b.w * b.h - interArea;
      const iou = interArea / unionArea;
      return iou < iouThreshold;
    });
  }
  return picked;
}

// --- Detect objects ---
async function detectObjects(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  const imageMeta = await sharp(imageBuffer).metadata();
  const origWidth = imageMeta.width;
  const origHeight = imageMeta.height;

  const resizedBuffer = await sharp(imageBuffer)
    .resize(640, 640, { fit: "cover" })
    .raw()
    .toBuffer();

  const data = [];
  for (let i = 0; i < resizedBuffer.length; i += 3) {
    data.push(resizedBuffer[i] / 255);
    data.push(resizedBuffer[i + 1] / 255);
    data.push(resizedBuffer[i + 2] / 255);
  }

  const inputTensor = new ort.Tensor("float32", Float32Array.from(data), [1, 3, 640, 640]);
  const session = await ort.InferenceSession.create(MODEL_PATH);
  const results = await session.run({ images: inputTensor });

  const outputName = session.outputNames[0];
  const output = results[outputName].data;

  const rawBoxes = [];
  for (let i = 0; i < output.length; i += 85) {
    const conf = output[i + 4];
    if (conf > CONF_THRESH) {
      // YOLOv5 outputs center x,y
      const cx = output[i] * origWidth;
      const cy = output[i + 1] * origHeight;
      const w = output[i + 2] * origWidth;
      const h = output[i + 3] * origHeight;

      if (w < 20 || h < 20) continue; // ignore very small boxes

      rawBoxes.push({
        x: cx - w / 2,
        y: cy - h / 2,
        w,
        h,
        confidence: conf
      });
    }
  }

  const boxes = nonMaxSuppression(rawBoxes, IOU_THRESH);
  return boxes;
}

module.exports = { detectObjects };
