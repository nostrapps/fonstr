# Migration Guide: v0.0.x → v0.1.0

## What Changed?

fonstr v0.1.0 is now powered by [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer), transforming it from a standalone Nostr relay into a **Nostr relay + web server**.

## Breaking Changes

**None!** The CLI interface remains the same:

```bash
npx fonstr [port]        # Still works
npx fonstr --help        # Still works  
npx fonstr --https       # Still works
```

## What's New

### 1. Built-in Web Server

You can now serve static files alongside your relay:

```bash
mkdir fonstr-data
echo '<h1>My Relay</h1>' > fonstr-data/index.html
npx fonstr

# Visit http://localhost:4444 - see your page
# Connect to ws://localhost:4444/relay - use relay
```

### 2. Cross-Platform Compatibility

- ✅ Android/Termux (53 second install, no compilation!)
- ✅ Windows (no build tools needed)
- ✅ macOS, Linux

### 3. Additional Features

All JSS features are available:

- NIP-98 HTTP authentication
- Solid Protocol (LDP) storage
- ActivityPub federation
- OIDC/WebAuthn authentication
- Multi-user mode

Use command-line flags to enable.

## Data Migration

**v0.0.x stored events in memory only** (not persisted).

**v0.1.0 also stores events in memory** by default, but can persist to disk if you enable Solid/LDP storage:

```bash
npx fonstr --solid-storage
```

## Performance Comparison

| Metric | v0.0.13 | v0.1.0 | Notes |
|--------|---------|---------|-------|
| Startup | ~1s | ~3s | Slight increase due to additional features |
| Response | <1ms | <1ms | Same performance |
| Memory | ~50MB | ~80MB | More features = slightly more memory |
| Install | ~5s | ~53s on Android | Pure JS, no compilation needed |

## Configuration Changes

### Environment Variables (New)

```bash
PORT=8080 npx fonstr              # Custom port
DATA_ROOT=/var/fonstr npx fonstr  # Custom data directory
```

### Command Line (Same + New Options)

```bash
npx fonstr --port 8080            # Custom port (same as before)
npx fonstr --https                # HTTPS support (same as before)
npx fonstr --nostr-relay          # Explicitly enable relay (on by default)
npx fonstr --root ./data          # Custom root directory
npx fonstr --multiuser            # Multi-user mode (new)
npx fonstr --no-auth              # Disable auth (new)
```

## Use the Legacy Version

If you need the standalone v0.0.13:

```bash
npx fonstr@0.0.13
```

The legacy implementation is preserved in `index.js.legacy` on the `feat/jss-rebase` branch.

## Troubleshooting

### Issue: Port already in use

Both versions default to port 4444. If upgrading:

```bash
npx fonstr 8080  # Use different port
```

### Issue: Data directory conflicts

v0.1.0 uses `./fonstr-data` by default (vs `./data` in v0.0.x):

```bash
DATA_ROOT=./data npx fonstr  # Use old directory
```

### Issue: Missing dependencies

Clear npm cache and reinstall:

```bash
rm -rf ~/.npm/_npx
npx fonstr@latest
```

## Getting Help

- **General questions**: [fonstr issues](https://github.com/nostrapps/fonstr/issues)
- **Relay bugs**: [JSS issues](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer/issues)
- **Documentation**: [README](README.md)

## Feedback

Found a bug or have a suggestion? [Open an issue](https://github.com/nostrapps/fonstr/issues)!
