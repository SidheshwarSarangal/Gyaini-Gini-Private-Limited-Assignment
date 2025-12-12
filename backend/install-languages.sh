#!/bin/bash

echo "📥 Downloading Tesseract languages..."
mkdir -p ./tessdata

curl -L https://github.com/tesseract-ocr/tessdata_best/archive/refs/heads/main.zip -o tessdata.zip

echo "📦 Extracting..."
unzip -q tessdata.zip
mv tessdata_best-main/* ./tessdata/

rm -rf tessdata.zip tessdata_best-main

echo "✅ Language files installed successfully in ./tessdata/"
