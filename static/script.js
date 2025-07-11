function updatePreview() {
  const url = document.getElementById('videoURL').value;
  const frame = document.getElementById('previewFrame');
  const id = extractVideoId(url);
  if (id) {
    frame.style.display = 'block';
    frame.src = `https://www.youtube.com/embed/${id}`;
  } else {
    frame.style.display = 'none';
    frame.src = '';
  }
}

function extractVideoId(url) {
  const m = url.match(/(?:v=|\\/)([0-9A-Za-z_-]{11})/);
  return m ? m[1] : null;
}

function startDownload() {
  const url      = document.getElementById('videoURL').value.trim();
  const quality  = document.getElementById('qualitySelect').value;
  const msg      = document.getElementById('message');

  if (!url) { msg.textContent = '⚠️ Enter a URL first'; msg.style.color = '#ffcc00'; return; }

  msg.textContent = '⏳ Preparing your download…'; msg.style.color = '#00ffff';

  fetch('/download', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ url, format: quality })
  })
  .then(r => { if (!r.ok) throw new Error('Server error'); return r.blob(); })
  .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'video.mp4';
      a.style.display = 'none';
      document.body.appendChild(a);

      requestAnimationFrame(() => {
        a.click();
        setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1500);
      });

      msg.textContent = '✅ Download started!';
      msg.style.color = '#00ff99';
  })
  .catch(err => { msg.textContent = '❌ ' + err.message; msg.style.color = '#ff3333'; });
}
