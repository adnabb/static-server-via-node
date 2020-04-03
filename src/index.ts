import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import mimeTypeMap from './mimeTypeMap';

const port = 8089;
const host = 'localhost';
const root = 'public';
let notFoundPage: Buffer;

const getRequestCompletePath = (request: http.IncomingMessage) => {
  let { pathname } = new URL(request.url, `http://${request.headers.host}`);
  if (pathname === '/') pathname = '/index.html';
  return pathname;
}

const getFileMimeAndPath = (pathname:string) => {
  const fileType = pathname.match(/\..*/) ? pathname.match(/\..*/)[0] : '.html';
  const { mime, path: filePath } = mimeTypeMap[fileType];
  const readFilePath = filePath ? path.join(root, filePath, pathname) : path.join(root, pathname);

  return { mime: mime, path: readFilePath, };
};

const server = http.createServer((request, response) => {
  if (request.method !== 'GET') { response.statusCode = 405; response.end(); return; }

  const requestUrl = getRequestCompletePath(request);
  const { path: readFilePath, mime } = getFileMimeAndPath(requestUrl);
  fs.readFile(readFilePath, (error, data) => {
    if (error) {
      console.error('error', error);
      response.statusCode = 404;
      notFoundPage = fs.readFileSync(path.join(root, '404.html'));
    }
    response.setHeader('Content-Type', mime);
    response.end(data || notFoundPage);
  });
});

server.listen(port, host, () => {
  console.log(`you are listening http://${host}:${port}`);
});