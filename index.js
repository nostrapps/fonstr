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
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse command line arguments
const args = process.argv.slice(2)
const port = args.find(arg => !arg.startsWith('-')) || process.env.PORT || '4444'
const dataRoot = process.env.DATA_ROOT || './fonstr-data'

// Create data directory if it doesn't exist
if (!existsSync(dataRoot)) {
  mkdirSync(dataRoot, { recursive: true })
}

// Create default index.html if it doesn't exist
const indexPath = join(dataRoot, 'index.html')
if (!existsSync(indexPath)) {
  const welcomePage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>fonstr - Your Nostr Relay</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        .emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.25rem;
            opacity: 0.95;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .relay-info {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 2rem;
            margin: 2rem 0;
        }
        code {
            background: rgba(255, 255, 255, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 1.1rem;
            display: inline-block;
            margin: 0.5rem 0;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .stat {
            background: rgba(255, 255, 255, 0.15);
            padding: 1rem;
            border-radius: 0.5rem;
        }
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 0.25rem;
        }
        a {
            color: white;
            text-decoration: none;
            border-bottom: 2px solid rgba(255, 255, 255, 0.5);
            transition: border-color 0.2s;
        }
        a:hover {
            border-color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">⚡</div>
        <h1>fonstr</h1>
        <p>Your Nostr relay is running!</p>

        <div class="relay-info">
            <p style="font-size: 1rem; margin-bottom: 1rem; opacity: 0.9;">Connect to your relay:</p>
            <code>ws://localhost:${port}/relay</code>

            <div class="stats">
                <div class="stat">
                    <div class="stat-label">Status</div>
                    <div class="stat-value">✓ Online</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Protocol</div>
                    <div class="stat-value">NIP-01</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Port</div>
                    <div class="stat-value">${port}</div>
                </div>
            </div>
        </div>

        <p style="font-size: 1rem;">
            Add this relay to your favorite Nostr client and start using it!<br>
            <a href="https://fonstr.com" target="_blank">Learn more about fonstr</a>
        </p>

        <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 2rem;">
            Replace this page by editing <code style="font-size: 0.8rem;">index.html</code> in your data directory
        </p>
    </div>
</body>
</html>`

  writeFileSync(indexPath, welcomePage, 'utf-8')
}

// Create public ACL for root to allow public access to index.html
const aclPath = join(dataRoot, '.acl')
if (!existsSync(aclPath)) {
  const publicAcl = `@prefix acl: <http://www.w3.org/ns/auth/acl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#public>
    a acl:Authorization ;
    acl:accessTo <./> ;
    acl:default <./> ;
    acl:mode acl:Read ;
    acl:agentClass foaf:Agent .
`
  writeFileSync(aclPath, publicAcl, 'utf-8')
}

// Build JSS arguments with Nostr-first defaults
const jssArgs = [
  'start',
  '--port', port,
  '--root', dataRoot,
  '--nostr',  // Enable Nostr relay
  '--single-user',  // Single-user mode (simpler, no registration)
  '--no-idp',  // Disable Identity Provider
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
