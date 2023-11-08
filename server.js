const express = require('express');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const app = express();
const wss = new WebSocket.Server({ noServer: true });


const keywordURLMap = {
  'gachi': ['https://www.youtube.com/embed/ZEZrULIUUmM?si=QJtYWdx6EZhKDeED'],
  'pdfile': ['https://vpn.ivanovmakarov.com/pdfile.pdf'],
  'skala': ['https://vpn.ivanovmakarov.com/skala.jpg', 'https://vpn.ivanovmakarov.com/rock.jpg'],
  'sus': ['https://vpn.ivanovmakarov.com/amogus.jpg', 'https://vpn.ivanovmakarov.com/suslik.jpg']
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const urls = keywordURLMap[message] || [];
    ws.send(JSON.stringify(urls));
  });
});

app.use(express.json());
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/client.html');
});

app.post('/keyword', (req, res) => {
  const { keyword } = req.body;
  const urls = keywordURLMap[keyword] || [];
  res.json(urls);
});

app.get('/download', (req, res) => {
  const { url } = req.query;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    https.get(url, (response) => {
      response.pipe(res);
    });
  } else {
    const filePath = __dirname + '/' + url;
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const urls = keywordURLMap[message] || [];
    ws.send(JSON.stringify(urls));
  });
});

const privateKey = fs.readFileSync('/etc/letsencrypt/live/vpn.ivanovmakarov.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/vpn.ivanovmakarov.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/vpn.ivanovmakarov.com/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const server = https.createServer(credentials, app);

server.listen(443, () => {
  console.log('Server is listening on port 443');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});