import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import mimeTypeMap from './mimeTypeMap';

const port = 8089;
const host = 'localhost';
const root = 'public';

const getRequestCompletePath = (request: http.IncomingMessage) => {
  let { pathname } = new URL(request.url, `http://${request.headers.host}`);
  if (pathname === '/') pathname = '/index.html';
  return pathname;
}

const getFileMimeAndPath = (pathname: string) => {
  let fileType = pathname.match(/\..*/) ? pathname.match(/\..*/)[0] : '';
  if (!(fileType in mimeTypeMap)) fileType = '.html';
  const { mime, path: filePath } = mimeTypeMap[fileType];
  const readFilePath = filePath ? path.join(root, filePath, pathname) : path.join(root, pathname);

  return { mime: mime, path: readFilePath, };
};

let _server:http.Server;

const createServer = () => {
  _server = http.createServer((request, response) => {
    if (request.method !== 'GET') { response.statusCode = 405; response.end(); return; }
  
    const requestUrl = getRequestCompletePath(request);
    const { path: readFilePath, mime } = getFileMimeAndPath(requestUrl);
    let statusCode = 200;
    fs.readFile(readFilePath, (error, data) => {
      if (error) {
        console.error('error', error);
        statusCode = 404;
        data = fs.readFileSync(path.join(root, '404.html'));
      }
      response.writeHead(statusCode, {
        'Content-Type': mime,
        'Content-Length': data.length,
      }).end(data);
    });
  });

  _server.listen(port, host, () => {
    console.log(`you are listening http://${host}:${port}`);
  });
}

export default createServer;