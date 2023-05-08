#!/usr/bin/env node

import minimist from 'minimist'
import { createServer } from '../index.js'

const argv = minimist(process.argv.slice(2))
const useHttps = argv.h || argv.https

console.log(argv)

let port
for (const arg of argv._) {
  if (parseInt(arg)) {
    port = parseInt(arg)
    break
  }
}

if (!port) {
  port = 4444
}

createServer({ port, useHttps })
