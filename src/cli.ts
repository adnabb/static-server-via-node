#!/usr/bin/env node

import commander from 'commander';
import createServer from './index';
import { version } from '../package.json';
const { program } = commander;
program
  .version(version)
  .name('static');
if (process.argv.length === 2) { createServer(); }
program.parse(process.argv);
