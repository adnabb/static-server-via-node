import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import colors from 'colors/safe';
// import * as zlib from 'zlib';
import mimeTypeMap from './mimeTypeMap';

let _root: string;
let port = 8089;
const host = 'localhost';

const getRequestCompletePath = (request: http.IncomingMessage) => {
  let { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/') pathname = '/index.html';
  return pathname;
}

const getFileMimeAndCompletePath = (pathname: string) => {
  // @ts-ignore
  let fileType: string = pathname.match(/\..*/) ? pathname.match(/\..*/)[0] : '';
  // default fileType: .html
  if (!(fileType in mimeTypeMap)) fileType = '.html';
  const { mime, path: filePath } = mimeTypeMap[fileType];
  const readFilePath = filePath ? path.join(_root, filePath, pathname) : path.join(_root, pathname);

  return { mime: mime, path: readFilePath, };
};

const getRootPath = (customPath?: string) => {
  if (!customPath) {
    return process.cwd();
  } else if (path.isAbsolute(customPath)) {
    return customPath;
  }

  return path.join(process.cwd(), customPath);
}

const handleNotGetRequest = (response: http.ServerResponse) => {
  response.statusCode = 405;
  response.end();
}

const get404HTML = (rootPath: string) => {
  let htmlBuffer: Buffer;
  return new Promise((resolve) => {
    fs.readFile(path.join(rootPath, '404.html'), (error, data) => {
      if (error) {
        htmlBuffer = fs.readFileSync(path.resolve(__dirname, '../public', '404.html'));
      } else {
        htmlBuffer = data;
      }
      resolve(htmlBuffer);
    });
  })
}

const getConsoleDir = (customPath?: string) => {
  if (!customPath) return '.';
  if (customPath.charAt(0) !== '.') return './' + customPath;
  return customPath;
}

let _server: http.Server;

export const setPort = (customPort: number) => { port = customPort; }

export const createServer = (customPath?: string) => {
  _root = getRootPath(customPath); //  eg. G:\Code\static-server-via-node

  _server = http.createServer((request, response) => {
    if (request.method !== 'GET') { handleNotGetRequest(response); return; }
    const requestUrl = getRequestCompletePath(request); // eg. /index.html
    const { path: readFilePath, mime } = getFileMimeAndCompletePath(requestUrl); // eg. G:\Code\static-server-via-node\index.html

    let statusCode = 200;
    fs.readFile(readFilePath, async (error, data) => {
      if (error) {
        console.error(colors.red('look at this error'), error);
        statusCode = 404;
        // @ts-ignore
        // TODO: FIX THIS
        data = await get404HTML(_root);
      }
      response.writeHead(statusCode, {
        'Content-Type': mime,
        'Content-Length': data.length,
      });
      response.end(data);
    });
    // TODO: zlib
    // const raw = fs.createReadStream(readFilePath);
    // 存储资源的压缩版本和未压缩版本。
    // response.setHeader('Vary: Accept-Encoding');
    //   let acceptEncoding = request.headers['accept-encoding'];
    //   if (!acceptEncoding) { acceptEncoding = ''; }
    //   response.writeHead(200, { 'Content-Encoding': 'gzip' });
    //   raw.pipe(zlib.createGzip()).pipe(response);
  });

  _server.listen(port, host, () => {
    console.info(colors.yellow('Starting up static-server-via-node, serving '), colors.cyan(getConsoleDir(customPath)));
    console.info(colors.yellow('Avaliable on:'));
    console.info(`  http://${host}:` + colors.green(port.toString()));
    console.info('Hit CTRL+C to stop the server');
  });
}

if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', function () {
    // @ts-ignore
    process.emit('SIGINT');
  });
}

process.on('SIGINT', function () {
  console.info(colors.red('http-server stopped.'));
  process.exit();
});

process.on('SIGTERM', function () {
  console.info(colors.red('http-server stopped.'));
  process.exit();
});
