// ===============================
//  script.js  (fully replaceable)
// ===============================
// Works on desktop + Android (Chrome, Samsung Internet, Firefox)

function updatePreview() {
  const url   = document.getElementById('videoURL').value.trim();
  const frame = document.getElementById('previewFrame');
  const id    = extractVideoId(url);

  if (id) {
    frame.style.display = 'block';
    frame.src = `https://www.youtube.com/embed/${id}`;
  } else {
    frame.style.display = 'none';
    frame.src = '';
  }
}

/**
 * Extract the 11‑character YouTube ID from any standard URL.
 */
function extractVideoId(url) {
  const match = url.match(/(?:v=|[\\/])([0-9A-Za-z_-]{11})(?:[?&#]|$)/);
  return match ? match[1] : null;
}

/**
 * POST the URL + format to the Flask backend and trigger a download.
 */
function startDownload() {
  const url     = document.getElementById('videoURL').value.trim();
  const quality = document.getElementById('qualitySelect').value;
  const msg     = document.getElementById('message');

  if (!url) {
    showMessage('⚠️ Please enter a YouTube URL first', '#ffcc00');
    return;
  }

  showMessage('⏳ Preparing your download…', '#00ffff');

  fetch('/download', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ url, format: quality })
  })
  .then(res => {
    if (!res.ok) throw new Error('Server error');
    return res.blob();
  })
  .then(blob => triggerMobileFriendlyDownload(blob))
  .catch(err => showMessage('❌ Download failed: ' + err.message, '#ff3333'));
}

/**
 * Show status text on the page.
 */
function showMessage(text, color) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.style.color = color;
}


function triggerMobileFriendlyDownload(blob) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = 'video.mp4';
  a.style.display = 'none';
  document.body.appendChild(a);

  requestAnimationFrame(() => {
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      a.remove();
    }, 1500);
  });

  showMessage('✅ Download started!', '#00ff99');
}
