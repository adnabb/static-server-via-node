import * as http from "http";

const port = 8089;
const host = 'localhost';
const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.end('hi');
});

server.listen(port, host, () => {
  console.log(`you are listening http://${host}:${port}`);
});