<div align="center">
  <h1>🚀 fonstr</h1>
  <h3>Run Your Own Nostr Relay in One Line</h3>
</div>

<div align="center">

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nostrapps/fonstr/blob/gh-pages/LICENSE)
[![npm](https://img.shields.io/npm/v/fonstr)](https://npmjs.com/package/fonstr)
[![npm](https://img.shields.io/npm/dw/fonstr.svg)](https://npmjs.com/package/fonstr)
[![Github Stars](https://img.shields.io/github/stars/nostrapps/fonstr.svg)](https://github.com/nostrapps/fonstr/)

</div>

---

<div align="center">
  <h2>⚡ Get Started in 10 Seconds</h2>
</div>

```bash
npx fonstr
```

**That's it.** You now have a Nostr relay running at `ws://localhost:4444/relay`

No config files. No dependencies. No Docker. No setup. **It just works.**

---

## 📱 Yes, Even on Your Phone

Run a Nostr relay on your Android phone with Termux:

```bash
npx fonstr
```

**Under 90 seconds** from zero to running relay. On a phone. In your pocket.

<img width="731" alt="fonstr running on Android/Termux" src="https://github.com/user-attachments/assets/0d8808ef-3a43-40df-bcfd-7c10a13614b9" />

---

## 🤯 What You Get

Type one command. Get all of this:

### 🔌 Full Nostr Relay
- ✅ **NIP-01** compliant (EVENT, REQ, CLOSE, EOSE)
- ✅ **NIP-11** relay information endpoint
- ✅ **NIP-98** HTTP authentication with Nostr keys
- ✅ Event filtering, subscriptions, real-time updates
- ✅ Rate limiting & memory protection
- ✅ WebSocket (ws://) and secure WebSocket (wss://)

### 🌐 Built-in Web Server
- ✅ Serve your relay's landing page
- ✅ Static file hosting (HTML, CSS, JS, images)
- ✅ REST APIs
- ✅ HTTPS support
- ✅ CORS enabled

### 🌍 Runs Everywhere
- ✅ **Android/Termux** (install in under 90 seconds!)
- ✅ **Windows** (no build tools needed!)
- ✅ **macOS, Linux, Raspberry Pi**
- ✅ **Pure JavaScript** (no compilation, no native modules)
- ✅ **Node.js 18+** only requirement

---

## 🎯 Quick Examples

### 1. Basic Relay (10 seconds)

```bash
npx fonstr
```

Done. Your relay is live at:
- **Nostr relay**: `ws://localhost:4444/relay`
- **Web interface**: `http://localhost:4444`

### 2. Custom Port (11 seconds)

```bash
npx fonstr 8080
```

Relay now at `ws://localhost:8080/relay`

### 3. With Your Own Landing Page (30 seconds)

```bash
mkdir fonstr-data
cat > fonstr-data/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>My Nostr Relay</title>
  <style>
    body {
      font-family: system-ui;
      max-width: 600px;
      margin: 100px auto;
      text-align: center;
    }
    code {
      background: #f4f4f4;
      padding: 20px;
      display: block;
      margin: 20px 0;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>⚡ Welcome to My Relay</h1>
  <p>Connect with any Nostr client:</p>
  <code>ws://localhost:4444/relay</code>
</body>
</html>
EOF

npx fonstr
```

Visit `http://localhost:4444` → See your beautiful landing page
Connect to `ws://localhost:4444/relay` → Use your relay

### 4. HTTPS/WSS (Production Ready)

```bash
# Put your SSL certs in current directory:
# - fullchain.pem
# - privkey.pem

npx fonstr --https
```

Now you have `wss://` (secure WebSocket) for production use.

---

## 💪 Why fonstr?

| Other Relays | fonstr |
|-------------|--------|
| Install dependencies | ✅ **Zero install** (`npx`) |
| Configure settings | ✅ **Zero config** (sensible defaults) |
| Setup database | ✅ **Zero setup** (works out of box) |
| Compile native code | ✅ **Pure JavaScript** (no compilation) |
| Read documentation | ✅ **One command** to start |
| 5-30 minutes | ✅ **10 seconds** |

---

## 📊 Performance

Don't let "easy" fool you. fonstr is **fast**:

- ⚡ **Startup**: ~3 seconds
- ⚡ **Response time**: Sub-millisecond
- ⚡ **Throughput**: 1,500+ requests/second
- ⚡ **Install** (Android): Under 90 seconds from scratch
- ⚡ **Memory**: ~80MB (efficient)

---

## 🧪 Test Your Relay

Connect from any Nostr client, or test with JavaScript:

```javascript
// Connect to your relay
const relay = new WebSocket('ws://localhost:4444/relay')

relay.onopen = () => {
  // Subscribe to notes
  relay.send(JSON.stringify([
    'REQ',
    'my-sub',
    { kinds: [1], limit: 10 }
  ]))
}

relay.onmessage = (msg) => {
  const [type, ...data] = JSON.parse(msg.data)
  console.log('Received:', type, data)
}
```

---

## 🎨 Customize Everything

### Environment Variables

```bash
PORT=8080 npx fonstr              # Custom port
DATA_ROOT=/var/fonstr npx fonstr  # Custom data directory
```

### Command Line Options

```bash
npx fonstr --help                 # Show all options
npx fonstr --port 8080            # Custom port
npx fonstr --root ./data          # Custom data directory
npx fonstr --https                # Enable HTTPS/WSS
npx fonstr --multiuser            # Multi-user mode
npx fonstr --no-auth              # Disable authentication
```

---

## 🌟 Beyond Relays

Powered by [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer), fonstr can do more when you need it:

### Optional Features (Opt-in)
- 🔐 **WebAuthn/Passkeys**: Passwordless authentication
- 🌐 **Solid Protocol**: Decentralized personal data pods
- 🐘 **ActivityPub**: Federate with Mastodon/Pleroma
- 🆔 **OIDC Provider**: OpenID Connect identity server
- 👥 **Multi-user**: Host relays for multiple users

Enable via command-line flags when needed. Default is simple relay mode.

---

## 🎯 Use Cases

### 1. **Personal Relay**
Run your own relay. Keep your notes. Own your data.

```bash
npx fonstr
```

### 2. **Development & Testing**
Test your Nostr app against a local relay.

```bash
npx fonstr 4444
# Develop your app
# Stop relay (Ctrl+C)
```

### 3. **Community Relay**
Run a relay for your community with a custom landing page.

```bash
mkdir my-relay-site
cd my-relay-site
# Add index.html, logo.png, etc.
DATA_ROOT=. npx fonstr
```

### 4. **Mobile Relay**
Run a relay on your Android phone. Take it anywhere.

```bash
# On Android with Termux
pkg install nodejs-lts
npx fonstr
```

### 5. **Production Relay**
Scale to thousands of users with HTTPS/WSS.

```bash
npx fonstr --https --port 443
```

---

## 🐳 Docker (Optional)

Prefer Docker? We got you:

```bash
docker run -d -p 4444:4444 ghcr.io/nostrapps/fonstr:latest
```

Or build locally:

```bash
git clone https://github.com/nostrapps/fonstr.git
cd fonstr
docker build -t fonstr .
docker run -d -p 4444:4444 fonstr
```

---

## 🔗 Relay Endpoints

Once running, your relay exposes:

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `ws://localhost:4444/relay` | Nostr relay WebSocket | Connect with any client |
| `http://localhost:4444/relay/info` | NIP-11 relay info (JSON) | Relay metadata |
| `http://localhost:4444/` | Web server root | Serve your landing page |

---

## 🚀 From Zero to Relay in Under 90 Seconds (Android)

**Proof:** Install fonstr on a fresh Android phone with Termux:

```bash
# 1. Install Termux from F-Droid
# 2. Open Termux, run:

pkg update && pkg install nodejs-lts
npx fonstr

# Done. Under 90 seconds total.
```

No other relay can do this.

---

## 🛠️ Advanced Configuration

### Persistent Storage

```bash
# Store events to disk (optional)
npx fonstr --solid-storage
```

### Custom Domain with SSL

```bash
# 1. Get SSL cert (Let's Encrypt)
# 2. Put fullchain.pem and privkey.pem in current directory
# 3. Run with HTTPS

npx fonstr --https --port 443
```

Now accessible at `wss://yourdomain.com/relay`

### Behind Nginx

```nginx
# /etc/nginx/sites-available/relay
upstream fonstr {
  server 127.0.0.1:4444;
}

server {
  listen 80;
  server_name relay.yourdomain.com;

  location / {
    proxy_pass http://fonstr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

## 📚 Learn More

### Nostr Resources
- [Nostr Protocol](https://github.com/nostr-protocol/nostr) - Core protocol
- [NIPs](https://github.com/nostr-protocol/nips) - Protocol specs
- [Awesome Nostr](https://github.com/aljazceru/awesome-nostr) - Ecosystem

### fonstr
- [Blog Post](https://dev.to/melvincarvalho/run-a-nostr-relay-on-your-phone-with-termux-and-fonstr-4cmg) - Run relay on phone
- [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer) - Underlying engine
- [Issues](https://github.com/nostrapps/fonstr/issues) - Report bugs, request features

---

## ❓ FAQ

**Q: Do I need to install anything?**
A: No. `npx` downloads and runs fonstr temporarily. Node.js 18+ is the only requirement.

**Q: Where are events stored?**
A: In memory by default. Use `--solid-storage` to persist to disk.

**Q: Can I use this in production?**
A: Yes! Use `--https` for WSS support. fonstr handles 1,500+ req/sec.

**Q: What's the difference from other relays?**
A: fonstr is the easiest to install and run. Zero config, zero setup, works everywhere.

**Q: Can I run multiple relays?**
A: Yes. Use different ports: `npx fonstr 4444` and `npx fonstr 5555`

**Q: Does it support NIP-XX?**
A: Supports NIP-01 (core), NIP-11 (info), NIP-98 (auth). More NIPs coming soon.

**Q: Can I contribute?**
A: Yes! PRs welcome. See [Contributing](#-contributing).

---

## 🤝 Contributing

We welcome contributions!

- 🐛 **Bug reports**: [Open an issue](https://github.com/nostrapps/fonstr/issues)
- 💡 **Feature requests**: [Start a discussion](https://github.com/nostrapps/fonstr/discussions)
- 🔧 **Pull requests**: Fork, change, PR
- 📖 **Documentation**: Help improve docs

For relay engine bugs, report to [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer/issues).

---

## 📄 License

**MIT License** - Use freely, commercially or personally.

See [LICENSE](LICENSE) for details.

---

## 🙏 Built With

- [JavaScriptSolidServer](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer) - Full-featured Solid + Nostr server
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) - Nostr protocol utilities
- [Fastify](https://fastify.io) - Fast web framework

---

<div align="center">
  <h2>⚡ Start Your Relay Now</h2>

  ```bash
  npx fonstr
  ```

  <p><strong>One command. One relay. Zero hassle.</strong></p>

  <p>⭐ Star this repo if fonstr helped you!</p>
</div>

---

**fonstr** - The easiest way to run a Nostr relay. Period.
