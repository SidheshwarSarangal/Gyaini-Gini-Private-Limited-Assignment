# Offline AI Tool for Digitizing Old Records

## Project Overview

This project is a **web application** designed to digitize old documents, including scanned pages, images, and handwritten or printed text, possibly in multiple languages. The solution is **fully offline**, leveraging `Tesseract.js` for OCR, and provides a pipeline for automated text extraction, storage in a database, and a user-friendly web interface.

---

## Features

- **OCR Pipeline**
  - Preprocess images using `sharp` (grayscale, normalize, sharpen, threshold).
  - Perform OCR using `Tesseract.js` on multiple languages (Indian, European, Middle Eastern, and East Asian languages).
  - Clean and normalize OCR text before saving to the database.

- **Fallback Strategy**
  - If OCR fails, the pipeline returns empty text with zero confidence.
  - Can be extended to use secondary OCR engines or manual review workflows.

- **Web App GUI**
  - Upload multiple images from a local computer or mobile device.
  - Real-time display of OCR results including:
    - File preview
    - Model used (Tesseract)
    - Confidence score
    - Extracted text
  - Records management page to view previously processed files.

- **Database Integration**
  - Uses `SQLite3` to store:
    - Upload metadata
    - OCR results with confidence scores
  - Prevents duplicate entries for the same file.

- **Offline Operation**
  - All OCR processing happens **offline** using `Tesseract.js` with a local `tessdata` folder (~1.8 GB) containing all language traineddata.
  - No external API calls are made during OCR.

---

## Folder Structure

Main repository contains two folders as frontend and backend

- The frontend contains the basic html/css based frontend along with the javascrpt files for running the functions
```
frontend/
├─ styles.css
├─ index.html
├─ records.html
├─ app.js
└─ records.js
```
- The backend contains the server for running the application. It contains the database, routes and controllers.

```
backend/
├─ controllers/
│ ├─ fileController.js
│ ├─ ocrPipelineController.js
│ ├─ recordsController.js
│ └─ tesseractController.js
├─ db/
│ └─ database.js
├─ routes/
│ ├─ file.js
│ ├─ ocrPipeline.js
│ ├─ records.js
│ └─ upload.js
├─ server.js
├─ install-language.sh
├─ package-lock.json
└─ package.json
```

PLease note that after runnig certians commands and after running the code, certain more files and folders will be added to the backend.

---

## Project Dependencies
This is a Node.js backend project using **Express**, **SQLite**, **image processing**, **PDF processing**, **OCR**, and **YOLO-based object detection**.  

It uses the following npm packages:

- `express` – Web framework
- `jimp` – Image processing
- `multer` – File upload handling
- `onnxruntime-node` – ONNX model inference
- `pdf-parse` – PDF parsing
- `pdf2pic` – Convert PDF pages to images
- `sharp` – Image processing
- `sqlite3` – Database
- `tesseract.js` – OCR
- `ultralytics` – YOLO-based object detection

---

## Linux System Dependencies

Before running the project, install the following **system packages** on Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y \
  nodejs \
  npm \
  build-essential \
  cmake \
  python3 \
  graphicsmagick \
  libvips-dev \
  sqlite3 \
  libsqlite3-dev \
  tesseract-ocr \
  tesseract-ocr-eng \
  ffmpeg \
  libsm6 \
  libxext6 \
  git
```

---

## How It Works

1. **Server Setup**
   - When the server is started, it runs on `http://localhost:3000`.
   - The frontend is served alongside the backend, so you can access it via `http://localhost:3000/index.html`.
   - On the first run, the server automatically creates:
     - An `uploads` folder for storing uploaded image files.
     - A `db.sqlite` file for storing OCR results and file metadata.

2. **Uploading an Image**
   - The user selects an image file using the file input on the frontend.
   - Clicking the **Upload & Submit** button triggers the upload process.
   - The **upload controller** handles the file upload and stores file metadata in the SQLite database.

3. **OCR Processing**
   - After the upload, the **OCR controller** processes the image using **Tesseract OCR**.
   - The image is preprocessed with **Sharp** to improve recognition (grayscale, sharpen, threshold).
   - The extracted text and confidence score are saved in the database along with file information.

4. **Displaying Results**
   - Once OCR is complete, the extracted text, confidence, and model used are displayed dynamically on the frontend.
   - The uploaded image is also displayed alongside the OCR result.

5. **Viewing Past Records**
   - Users can view all previous uploads and OCR results by clicking the **Records** button on the top right of the index page.
   - The **Records** page shows each file, its OCR text, confidence, and timestamp.
   - Records can be deleted individually if needed.

---


