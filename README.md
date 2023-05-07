

<div align="center">  
  <h1>fonstr</h1>
</div>

<div align="center">  
<i>fonstr</i>
</div>

---

<div align="center">
<h4>Documentation</h4>
</div>

---

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nostrapps/fonstr/blob/gh-pages/LICENSE)
[![npm](https://img.shields.io/npm/v/fonstr)](https://npmjs.com/package/fonstr)
[![npm](https://img.shields.io/npm/dw/fonstr.svg)](https://npmjs.com/package/fonstr)
[![Github Stars](https://img.shields.io/github/stars/nostrapps/fonstr.svg)](https://github.com/nostrapps/fonstr/)


# Fonstr Relay

A simple and efficient Nostr relay server designed to run on a mobile phone.  See [blog post](https://dev.to/melvincarvalho/run-a-nostr-relay-on-your-phone-with-termux-and-fonstr-4cmg) for more information.

## Features

- Event filtering based on Nostr specifications
- Efficient message handling and routing
- Easy to set up and configure

### Running the Relay

You can start the relay server using the `fonstr` command provided in the `bin` field of `package.json`. If you have installed the package globally or linked it, you can run:

```bash
fonstr [port]
```

Replace `[port]` with the desired port number. If no port is provided, the server will run on port 4444 by default.

If you have not installed the package globally or linked it, you can use `npx` to run the `fonstr` command:

```bash
npx fonstr [port]
```

Alternatively, you can run the server using `node`:

```bash
node index.js [port]
```

Now the Nostr relay server will be up and running, ready to handle incoming events and subscriptions.

### Installation from source

First, clone the repository and navigate to the project directory:

```bash
git clone https://github.com/nostrapps/fonstr.git
cd fonstr
```

Then, install the necessary dependencies:

```bash
npm install
```

## Docker

### Building the Docker Image

First, you need to build the Docker image for the server. Navigate to the root directory of the project, where the Dockerfile is located, and run the following command:

```bash
docker build -t fonstr .
```

### Running the Server with Docker

Now that you have built the Docker image, you can run a container using that image. You can map the port and mount a volume to persist the data directory.
Mapping the Port

Use the -p flag to map the host port to the container port. In this case, we'll map the host port 4444 to the container port 4444:

```bash
docker run -d -p 4444:4444 nosdav
```

## API

This Nostr relay server supports the following Nostr event types:

- `EVENT`: Publish an event
- `REQ`: Subscribe to events with specified filters
- `CLOSE`: Unsubscribe from a subscription
- `EOSE`: End of subscription events signal

## Example REQ

```javascript
// Connect to the Nostr relay server using a WebSocket
const socket = new WebSocket('ws://localhost:4444');

// Subscribe to events
socket.send(JSON.stringify(['REQ', 'subscription_id', { types: [1, 2, 3], kind: 1 }]));

// Listen for incoming events
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received data:', data);
});
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## Contributing

Contributions are welcome! Feel free to open a pull request or report any issues you find.

## License

- MIT
