const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const resultsDiv = document.getElementById("results");
const loadingDiv = document.getElementById("loading"); // NEW
const viewRecordsBtn = document.getElementById("viewRecordsBtn");

viewRecordsBtn.addEventListener("click", () => {
  window.location.href = "records.html"; // new page
});

uploadBtn.addEventListener("click", async () => {
  const files = fileInput.files;

  if (files.length === 0) {
    alert("Please select files first");
    return;
  }

  // Show loading
  loadingDiv.style.display = "block";
  resultsDiv.innerHTML = "";

  try {
    // 1️⃣ Upload files
    const formData = new FormData();
    for (let file of files) formData.append("files", file);

    const uploadRes = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();

    for (let f of uploadData.files) {
      try {
        const destRes = await fetch(
          `http://localhost:3000/file?filename=${encodeURIComponent(
            f.filename
          )}`
        );
        const destData = await destRes.json();

        if (destRes.ok) {
          const filePath = `${destData.destination}/${destData.filename}`;

          const ocrRes = await fetch("http://localhost:3000/pipeline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filePath,
              destination: destData.destination,
              filename: destData.filename,
            }),
          });

          const ocrData = await ocrRes.json();

          const box = document.createElement("div");
          box.className = "result";

          box.innerHTML = `
            <p><strong>File:</strong> ${ocrData.filename}</p>
            <img src="/uploads/${destData.filename}" 
                 alt="${ocrData.filename}" 
                 style="max-width:300px; max-height:300px; display:block; margin-bottom:10px;">
            <p><strong>Model Used:</strong> ${ocrData.model}</p>
            <p><strong>Confidence:</strong> ${ocrData.confidence || "N/A"}</p>
            <pre>${ocrData.text || ""}</pre>
            ${
              ocrData.message
                ? `<p style="color:red;"><strong>${ocrData.message}</strong></p>`
                : ""
            }
          `;

          resultsDiv.appendChild(box);
        }
      } catch (err) {
        console.error("Error processing file:", f.filename, err);
      }
    }
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "<p>Error while uploading or processing files</p>";
  }

  // Hide loading once everything finishes
  loadingDiv.style.display = "none";
});
