<div align="center">
  <h1>fonstr</h1>
</div>

<div align="center">
<i>Nostr relay + web server - Just works on phones, servers, everywhere</i>
</div>

---

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nostrapps/fonstr/blob/gh-pages/LICENSE)
[![npm](https://img.shields.io/npm/v/fonstr)](https://npmjs.com/package/fonstr)
[![npm](https://img.shields.io/npm/dw/fonstr.svg)](https://npmjs.com/package/fonstr)
[![Github Stars](https://img.shields.io/github/stars/nostrapps/fonstr.svg)](https://github.com/nostrapps/fonstr/)

# Fonstr

**fonstr** is a Nostr relay with a built-in web server, designed to run anywhere - from mobile phones to production servers. Get a Nostr relay AND a web server in one simple command.

Now powered by [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer) for maximum compatibility and features.

<img width="731" height="871" alt="Fonstr running on mobile" src="https://github.com/user-attachments/assets/0d8808ef-3a43-40df-bcfd-7c10a13614b9" />

## ✨ What You Get

**Nostr Relay:**
- ✅ NIP-01 compliant relay at `/relay`
- ✅ NIP-11 relay information endpoint
- ✅ NIP-98 HTTP authentication
- ✅ Event filtering, subscriptions, publishing
- ✅ Rate limiting and memory protection
- ✅ WebSocket (WSS) support

**Web Server:**
- ✅ Serve HTML, CSS, JavaScript files
- ✅ Static file hosting for your relay's landing page
- ✅ REST APIs
- ✅ HTTPS support
- ✅ CORS enabled

**Cross-Platform:**
- ✅ Works on Android/Termux (53 second install!)
- ✅ Windows, macOS, Linux
- ✅ No compilation required (pure JavaScript)
- ✅ Runs on phones, Raspberry Pi, servers

## 🚀 Quickstart

Run a Nostr relay + web server with one command:

```bash
npx fonstr [port]
```

Default port is 4444. No installation needed!

**Examples:**

```bash
# Run on default port 4444
npx fonstr

# Run on custom port
npx fonstr 8080

# Run with custom data directory
DATA_ROOT=./my-data npx fonstr
```

## 📖 Usage

### Basic Relay

```bash
npx fonstr
```

- Nostr relay: `ws://localhost:4444/relay`
- Web server: `http://localhost:4444`

### With Landing Page

Create a custom landing page for your relay:

```bash
mkdir fonstr-data
cat > fonstr-data/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>My Nostr Relay</title></head>
<body>
  <h1>Welcome to My Nostr Relay</h1>
  <p>Connect to: ws://localhost:4444/relay</p>
</body>
</html>
EOF

npx fonstr
```

Visit `http://localhost:4444` to see your landing page!

### Testing the Relay

Connect to your relay using any Nostr client:

```javascript
// Connect to the Nostr relay
const socket = new WebSocket('ws://localhost:4444/relay')

// Subscribe to events
socket.send(JSON.stringify(['REQ', 'my-sub', { kinds: [1], limit: 10 }]))

// Listen for events
socket.addEventListener('message', (event) => {
  const [type, ...data] = JSON.parse(event.data)
  console.log('Received:', type, data)
})

// Publish an event
socket.send(JSON.stringify(['EVENT', signedEvent]))
```

### HTTPS Support

```bash
# Place your SSL certificates in the current directory
# - fullchain.pem
# - privkey.pem

npx fonstr --https
```

## 🔧 Configuration

**Environment Variables:**

- `PORT` - Server port (default: 4444)
- `DATA_ROOT` - Data directory (default: ./fonstr-data)

**Command Line Options:**

```bash
npx fonstr --help                    # Show help
npx fonstr --port 8080               # Custom port
npx fonstr --root /var/fonstr        # Custom data directory
npx fonstr --https                   # Enable HTTPS
npx fonstr --no-auth                 # Disable authentication
npx fonstr --multiuser               # Enable multi-user mode
```

## 📦 Installation from Source

```bash
git clone https://github.com/nostrapps/fonstr.git
cd fonstr
npm install
npm start
```

## 🐳 Docker

### Build the Image

```bash
docker build -t fonstr .
```

### Run the Container

```bash
docker run -d -p 4444:4444 -v $(pwd)/data:/app/fonstr-data fonstr
```

## 🎯 Features

### Nostr Protocol Support

- **EVENT**: Publish events to the relay
- **REQ**: Subscribe to events with filters
- **CLOSE**: Unsubscribe from subscriptions
- **EOSE**: End of stored events signal
- **Event validation**: Schnorr signature verification
- **Replaceable events**: NIP-16 support
- **Ephemeral events**: Temporary events that aren't stored

### Web Server Capabilities

- Serve static files (HTML, CSS, JS, images)
- REST API endpoints
- WebSocket support
- CORS enabled by default
- Rate limiting
- HTTPS/WSS support

### Optional Advanced Features

Powered by JavaScriptSolidServer, you also get access to:

- **Solid Protocol (LDP)**: Decentralized data storage
- **ActivityPub**: Federation with Mastodon, Pleroma, etc.
- **OIDC Authentication**: OpenID Connect identity provider
- **WebAuthn/Passkeys**: Passwordless authentication
- **Multi-user mode**: Host pods for multiple users

Enable these features using command-line flags or environment variables.

## 🌐 Use Cases

1. **Personal Relay + Website**: Run your relay and serve your personal site
2. **Community Relay**: Add a web dashboard for relay statistics
3. **Mobile Relay**: Run a relay on your Android phone with Termux
4. **Development**: Local relay for testing Nostr apps
5. **Production Relay**: Scale to handle thousands of connections

## 📊 Performance

- **Startup time**: ~3 seconds
- **Response time**: Sub-millisecond
- **Throughput**: 1,500+ requests/sec
- **Install time** (Android): 53 seconds from scratch

## 🔗 API

### Relay Endpoints

- `ws://localhost:4444/relay` - Nostr relay WebSocket
- `http://localhost:4444/relay/info` - NIP-11 relay information (JSON)

### Web Server

- `http://localhost:4444/` - Serves files from data directory
- All standard HTTP methods supported (GET, POST, PUT, DELETE)

## 🆚 v0.0.x vs v0.1.0+

**v0.0.13 (legacy)**: Standalone Nostr relay (~400 LOC)
**v0.1.0+ (current)**: Nostr relay + web server powered by JSS (~20 LOC wrapper)

**Migration**: No breaking changes! Same CLI interface. Just get more features.

If you need the legacy version:
```bash
npx fonstr@0.0.13
```

## 🤝 Contributing

Contributions are welcome! Feel free to open a pull request or report issues.

For relay-specific bugs, please also report to [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer/issues).

## 📚 Resources

- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [NIPs (Nostr Implementation Possibilities)](https://github.com/nostr-protocol/nips)
- [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer)
- [jspod wrapper](https://github.com/JavaScriptSolidServer/jspod)
- [Blog: Run a Nostr relay on your phone](https://dev.to/melvincarvalho/run-a-nostr-relay-on-your-phone-with-termux-and-fonstr-4cmg)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Built on top of:
- [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer) - Full-featured Solid server with Nostr support
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) - Nostr protocol utilities

---

**fonstr** - Because your Nostr relay deserves a web server too 🚀
