const container = document.getElementById("recordsContainer");

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
});


async function loadRecords() {
  try {
    const res = await fetch("http://localhost:3000/records");
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = "<p>No records found.</p>";
      return;
    }

    container.innerHTML = "";

    data.forEach(r => {
      const box = document.createElement("div");
      box.className = "record-box";

      box.innerHTML = `
        <p><strong>Filename:</strong> ${r.filename}</p>
        <img src="/uploads/${r.filename}" style="max-width:200px;"><br>
        <p><strong>Model:</strong> ${r.model}</p>
        <p><strong>Confidence:</strong> ${r.confidence}</p>
        <pre>${r.text}</pre>
        <button class="delete-btn" data-id="${r.id}">Delete</button>
      `;

      container.appendChild(box);
    });

    attachDeleteEvents();
  } catch (err) {
    container.innerHTML = "<p>Error loading records.</p>";
    console.error(err);
  }
}

function attachDeleteEvents() {
    const buttons = document.querySelectorAll(".delete-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");

            if (!confirm("Delete this record?")) return;

            try {
                const res = await fetch(`http://localhost:3000/records/${id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    btn.parentElement.remove();
                } else {
                    alert("Failed to delete record.");
                }
            } catch (err) {
                alert("Error deleting.");
                console.error(err);
            }
        });
    });
}

loadRecords();
