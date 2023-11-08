const contentViewer = document.getElementById('content-viewer');
const urlSelect = document.getElementById('url-select');
const downloadProgress = document.getElementById('download-progress');

const ws = new WebSocket('wss://vpn.ivanovmakarov.com');

ws.addEventListener('open', (event) => {
  console.log('WebSocket connection opened:', event);
});

ws.addEventListener('message', (event) => {
  const urls = JSON.parse(event.data);

  urlSelect.innerHTML = '';

  urls.forEach((url, index) => {
    const option = document.createElement('option');
    option.value = url;
    option.textContent = `URL ${url}`;
    urlSelect.appendChild(option);
  });
});

const downloadFile = (selectedUrl) => {
  fetch(`/download?url=${encodeURIComponent(selectedUrl)}`)
    .then((response) => {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error('Failed to download file.');
      }
    })
    .then((blob) => {
      const urlParts = selectedUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(a.href);

      console.log('File downloaded successfully');
    })
    .catch((error) => {
      console.error('Download error:', error);
    });
};

const submitBtn = document.getElementById('submit-btn');
const downloadBtn = document.getElementById('download-btn');
const keywordInput = document.getElementById('keyword-input');
const showFileBtn = document.getElementById('show-file-btn');

submitBtn.addEventListener('click', () => {
  const keyword = keywordInput.value;
  ws.send(keyword);
});

urlSelect.addEventListener('change', () => {
  const selectedUrl = urlSelect.value;
  contentViewer.src = '';
  downloadProgress.value = 0;
  downloadFile(selectedUrl);
});

downloadBtn.addEventListener('click', () => {
  const selectedUrl = urlSelect.value;
  downloadFile(selectedUrl);
});

showFileBtn.addEventListener('click', () => {
  const selectedUrl = urlSelect.value;
  contentViewer.src = selectedUrl;
  contentViewer.addEventListener('load', () => {
    downloadBtn.disabled = false;
  });
});
