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

## Setup Backend

Clone the repository, install the required backend dependencies, download Tesseract language files, and start the backend server with the following commands:

```bash
# Clone the repository
git clone https://github.com/SidheshwarSarangal/Gyaini-Gini-Private-Limited-Assignment.git

# Navigate into the project directory
cd Gyaini-Gini-Private-Limited-Assignment/backend

# Install backend dependencies
npm install

# Make the Tesseract language installation script executable
chmod +x install-languages.sh
```

- install-languages.sh contains the following text -

```
echo "Downloading Tesseract languages..."
mkdir -p ./tessdata
curl -L https://github.com/tesseract-ocr/tessdata_best/archive/refs/heads/main.zip -o tessdata.zip
echo "Extracting..."
unzip -q tessdata.zip
mv tessdata_best-main/* ./tessdata/
rm -rf tessdata.zip tessdata_best-main
echo "Language files installed successfully in ./tessdata/"
```

- Run the following command in the backend folder, in order to run the server -

```bash
npm run dev
```

- Then you can run the application in the web browser with link
  
```http://localhost:3000/index.html```

---

# File Processing Pipeline


When files are uploaded via a FormData POST request, the frontend displays a loading indicator and clears previous results. The server saves the files, retrieves their storage paths, and runs an OCR pipeline. Images are preprocessed with Sharp—grayscaled, normalized, sharpened, and thresholded—to improve text recognition. Tesseract extracts the text and confidence score, which is then cleaned and saved in the database along with filename and file location.

The frontend dynamically displays each file’s thumbnail, OCR model, confidence score, extracted text, and any errors. A dedicated records page allows users to fetch, view, and manage all previous results. Individual records can also be accessed or deleted, which removes both the database entry and the file.

The backend exposes endpoints for all core operations: POST /upload for uploads, GET /file for file info, POST /pipeline for OCR processing, and CRUD operations on records via /records. By integrating upload, processing, OCR, storage, and display, the system provides a seamless, real-time file-to-text experience using Tesseract.js, Sharp, SQLite, and vanilla JavaScript.


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

# File Processing Fallback Decision Tree

This document describes the flow of the file processing and OCR pipeline, including fallback paths and error handling.

---

## Workflow

### 1. User Upload

- **Start:** User clicks the **Upload** button.
- **Check if files are selected**
  - **Yes:** Continue
  - **No:** Alert `"Please select files first"` → **End**

### 2. File Upload

- Show loading spinner
- Clear previous results
- Upload files to `/upload` endpoint
  - **Success:** Receive `uploadData.files`
  - **Fail:** Show `"Error while uploading or processing files"` → **End**

### 3. Process Each Uploaded File

For each file `f`:

#### 3.1 Fetch File Destination

- GET `/file?filename=f.filename`
  - **Success:** Receive `{ destination, filename }`
  - **Fail:** Log `"Error processing file: f.filename"` → Skip this file

#### 3.2 Validate Destination

- Check if `destination` and `filename` exist
  - **Yes:** Continue
  - **No:** Skip file → Log `"File not found"`

#### 3.3 Run OCR Pipeline

- POST `/pipeline` with `{ filePath, destination, filename }`
  - **Success:** Receive `{ text, confidence, model, message }`
  - **Fail:** Log `"OCR failed for file: f.filename"` → Show fallback `"N/A"` in frontend

#### 3.4 Process OCR Response

- **Text exists:** Save to DB using `saveResultToDB`
- **Text empty:** Skip saving → Optional log

#### 3.5 Render Result in Frontend

- Display:
  - Filename
  - Image
  - Model
  - Confidence
  - Text
- If `ocrData.message` exists → Show message in **red**

---

### 4. Final Steps

- After all files processed:
  - Hide loading spinner
  - Display all results (or errors for files that failed)

---

## Fallback / Error Handling Summary

| Scenario | Action |
|----------|--------|
| No files selected | Alert user → Stop |
| File upload fails | Display error → Stop |
| Destination not found in DB | Skip file → Log error |
| OCR fails / throws exception | Skip saving → Show `"N/A"` text or error message |
| Empty OCR result | Do not save to DB → Continue to next file |

---

This decision tree captures all conditional branches and fallback paths in the file processing and OCR pipeline.

