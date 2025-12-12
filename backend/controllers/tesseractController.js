const Tesseract = require("tesseract.js");

exports.run = async (filePath) => {
    const { data } = await Tesseract.recognize(filePath, "eng");

    return {
        text: data.text,
        confidence: data.confidence / 100
    };
};
