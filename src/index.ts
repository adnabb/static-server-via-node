import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'colors';
import mimeTypeMap from './mimeTypeMap';

let _root:string;
const port = 8089;
const host = 'localhost';

const getRequestCompletePath = (request: http.IncomingMessage) => {
  let { pathname } = new URL(request.url, `http://${request.headers.host}`);
  if (pathname === '/') pathname = '/index.html';
  return pathname;
}

const getFileMimeAndPath = (pathname: string) => {
  let fileType = pathname.match(/\..*/) ? pathname.match(/\..*/)[0] : '';
  // default fileType: .html
  if (!(fileType in mimeTypeMap)) fileType = '.html';
  const { mime, path: filePath } = mimeTypeMap[fileType];
  const readFilePath = filePath ? path.join(_root, filePath, pathname) : path.join(_root, pathname);

  return { mime: mime, path: readFilePath, };
};

const getRootPath = (customPath:string) => {
  if (!customPath) {
    return process.cwd();
  } else if (path.isAbsolute(customPath)) {
    return customPath;
  }

  return path.join(process.cwd(), customPath);
}

const handleNotGetRequest = (response:http.ServerResponse) => {
  response.statusCode = 405;
  response.end();
}

const get404HTML = () => fs.readFileSync(path.resolve(__dirname, '../public', '404.html'));

const setConsoleColorTheme = () => {
  colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
  });
};

let _server:http.Server;

const createServer = (customPath?:string) => {
   _root = getRootPath(customPath);
   setConsoleColorTheme();

  _server = http.createServer((request, response) => {
    if (request.method !== 'GET') { handleNotGetRequest(response); return; }

    const requestUrl = getRequestCompletePath(request);
    const { path: readFilePath, mime } = getFileMimeAndPath(requestUrl);
    let statusCode = 200;
    fs.readFile(readFilePath, (error, data) => {
      if (error) {
        // @ts-ignore
        console.error('error'.error, error);
        statusCode = 404;
        data = get404HTML();
      }
      response.writeHead(statusCode, {
        'Content-Type': mime,
        'Content-Length': data.length,
      });
      response.end(data);
    });
  });

  _server.listen(port, host, () => {
    // @ts-ignore
    console.info(`you are listening http://${host}:${port}`.info);
  });
}

export default createServer;