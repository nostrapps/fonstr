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
  '--port', port,
  '--nostr-relay',
  '--root', process.env.DATA_ROOT || './fonstr-data',
  ...args.filter(arg => arg.startsWith('-'))
]

// Spawn jspod (which wraps JSS)
const jspod = spawn('jspod', jssArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    PATH: `${join(__dirname, 'node_modules', '.bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`
  }
})

jspod.on('error', (err) => {
  console.error('Failed to start fonstr:', err.message)
  process.exit(1)
})

jspod.on('close', (code) => {
  process.exit(code || 0)
})

// Handle termination signals
process.on('SIGINT', () => {
  jspod.kill('SIGINT')
})

process.on('SIGTERM', () => {
  jspod.kill('SIGTERM')
})
