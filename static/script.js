function updatePreview() {
  const url = document.getElementById("videoURL").value;
  const frame = document.getElementById("previewFrame");

  const videoId = extractVideoId(url);
  if (videoId) {
    frame.style.display = "block";
    frame.src = `https://www.youtube.com/embed/${videoId}`;
  } else {
    frame.style.display = "none";
    frame.src = "";
  }
}

function extractVideoId(url) {
  const regExp = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function startDownload() {
  const url = document.getElementById("videoURL").value;
  const quality = document.getElementById("qualitySelect").value;
  const msg = document.getElementById("message");

  if (!url) {
    msg.innerText = "⚠️ Please enter a YouTube video URL!";
    msg.style.color = "#ffcc00";
    return;
  }

  msg.innerText = "⏳ Preparing your download...";
  msg.style.color = "#00ffff";

  fetch("/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url, format: quality })
  })
  .then(response => {
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
  })
  .then(blob => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "video.mp4";
    document.body.appendChild(link);
    link.click();
    link.remove();
    msg.innerText = "✅ Download started!";
    msg.style.color = "#00ff99";
  })
  .catch(error => {
    msg.innerText = "❌ Download failed: " + error.message;
    msg.style.color = "#ff3333";
  });
}
