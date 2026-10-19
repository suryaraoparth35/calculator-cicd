const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 8080);
const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/calculator.js': ['calculator.js', 'text/javascript; charset=utf-8'],
  '/arithmetic-core.js': ['arithmetic-core.js', 'text/javascript; charset=utf-8'],
};

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  if (pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const file = files[pathname];
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const filePath = path.join(__dirname, 'public', file[0]);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Unable to read application file');
      return;
    }
    res.writeHead(200, { 'content-type': file[1] });
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Calculator listening on port ${port}`);
});
