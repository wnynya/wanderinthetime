import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Test message</h1>');
});

server.listen(8080, () => {
  console.log('웹 서버가 켜졌습니다.');
});
