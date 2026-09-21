import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT, reqPath);

  // Security check to avoid path traversal
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end(`File not found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

let activePort = parseInt(PORT, 10);

function startServer(port) {
  server.listen(port, () => {
    const localIp = getLocalIp();
    console.log('\n\x1b[32m✔ Vault Mobile App Server is running!\x1b[0m');
    console.log(`\x1b[1m📱 On your phone (same Wi-Fi):\x1b[0m  \x1b[36mhttp://${localIp}:${port}\x1b[0m`);
    console.log(`\x1b[1m💻 On your computer:\x1b[0m           \x1b[36mhttp://localhost:${port}\x1b[0m`);
    console.log('\n\x1b[90mTip: On iPhone Safari tap Share -> "Add to Home Screen", or on Android Chrome tap "Install App" to use it full-screen like a native app.\x1b[0m\n');
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\x1b[33m⚠️ Port ${activePort} is busy. Trying port ${activePort + 1}...\x1b[0m`);
    activePort++;
    startServer(activePort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(activePort);

