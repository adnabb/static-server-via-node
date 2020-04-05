#!/usr/bin/env node

import commander from 'commander';
import { createServer, setPort } from './index';
import { version } from '../package.json';
const { program } = commander;
program
  .version(version)
  .name('static')
  .option('-p --port <number>', "input the port you'd like to use");

const { argv } = process;
let bootPath:string;
if (argv.length >= 3 && argv[3-1].indexOf('-') < 0) { bootPath = argv[2]; }

const portIndex = argv.indexOf('-p') >= 0 ? argv.indexOf('-p') : argv.indexOf('--port');
if (portIndex >= 0) {
  const customPort = parseInt(argv[portIndex + 1], 10);
  setPort(customPort);
}

createServer(bootPath);

program.parse(process.argv);
