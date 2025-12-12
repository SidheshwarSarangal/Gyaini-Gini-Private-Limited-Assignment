const Tesseract = require("tesseract.js");
const path = require("path");

// Local tessdata folder
const tessdataPath = path.join(__dirname, "../tessdata");

// List of major languages
const DEFAULT_LANGS = [
  "eng","hin","tam","tel","mal","kan","guj","pan","ori","asm","sin","mar","nep",
  "ara","heb","fas","urd",
  "fra","deu","spa","ita","por","rus","pol","nld","swe","nor","dan","fin","ces","slk",
  "jpn","kor","chi_sim","chi_tra","tha","lao","khm","vie"
];

async function recognize(imageBufferOrPath, langs = DEFAULT_LANGS) {
  // Convert array to '+' separated string
  if (Array.isArray(langs)) langs = langs.join("+");
  
  const { data } = await Tesseract.recognize(imageBufferOrPath, langs, {
    tessdata: tessdataPath,
    logger: (m) => console.log("Tesseract:", m.status), // optional
  });

  return { text: data.text, confidence: data.confidence / 100 };
}

module.exports = { recognize };
