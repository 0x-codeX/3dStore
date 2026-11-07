const fs = require('fs');
const path = require('path');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

module.exports = (req, res) => {
  // Resolve paths relative to the root execution context
  const root = path.join(__dirname, '..');
  const urlPath = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  
  const relative = urlPath === '/'
    ? 'index.html'
    : urlPath === '/manus-routes.json'
      ? 'public/manus-routes.json'
      : urlPath.replace(/^\/+/, '');
      
  const filePath = path.join(root, relative);

  // Security and existence checks
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mime[ext] || 'application/octet-stream', 
    'Cache-Control': 'no-cache'
  });
  
  fs.createReadStream(filePath).pipe(res);
};
