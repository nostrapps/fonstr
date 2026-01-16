#!/usr/bin/env node

/**
 * fonstr - Nostr relay + web server
 *
 * A simple wrapper around JavaScriptSolidServer with Nostr-first defaults.
 * Provides a full-featured Nostr relay plus web server capabilities.
 *
 * Usage:
 *   npx fonstr [port]
 *   npx fonstr --help
 */

import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse command line arguments
const args = process.argv.slice(2)
const port = args.find(arg => !arg.startsWith('-')) || process.env.PORT || '4444'

// Build JSS arguments with Nostr-first defaults
const jssArgs = [
  'start',
  '--port', port,
  '--root', process.env.DATA_ROOT || './fonstr-data',
  '--nostr',  // Enable Nostr relay
  '--no-multiuser',
  ...args.filter(arg => arg.startsWith('-'))
]

// Spawn jss directly (from jspod dependency)
const jss = spawn('jss', jssArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    PATH: `${join(__dirname, 'node_modules', '.bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`
  }
})

jss.on('error', (err) => {
  console.error('Failed to start fonstr:', err.message)
  process.exit(1)
})

jss.on('close', (code) => {
  process.exit(code || 0)
})

// Handle termination signals
process.on('SIGINT', () => {
  jss.kill('SIGINT')
})

process.on('SIGTERM', () => {
  jss.kill('SIGTERM')
})
