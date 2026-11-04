/* Servidor local de desenvolvimento: arquivos estáticos + /api/noticias (mesma função da Vercel).
   Uso: node dev-server.js  ->  http://127.0.0.1:5540 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const noticias = require('./api/noticias.js');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5540;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain',
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/noticias') return noticias(req, res);

  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}`));
