#!/usr/bin/env node

import commander from 'commander';
import createServer from './index';
import { version } from '../package.json';
const { program } = commander;
program
  .version(version)
  .name('static');
if (process.argv.length === 2) {
  createServer();
} else if (process.argv.length === 3) {
  createServer(process.argv[2]);
}
program.parse(process.argv);
