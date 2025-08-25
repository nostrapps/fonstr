// Example integration of DID endpoint into existing fonstr relay
import { addDIDEndpoint } from './did-endpoint.js'

function createServer ({ port, useHttps = false }) {
  const events = []
  const subscribers = new Map()

  // ... existing fastify setup ...

  const fi = fastify({
    https: httpsOptions,
    http2: false
  })

  // Register WebSocket
  fi.register(fastifyWebsocket)
  
  // **NEW: Register DID endpoint**
  addDIDEndpoint(fi, events)
  
  // Register WebSocket handler
  fi.register(async function (fastify) {
    // ... existing websocket code ...
  })

  fi.listen({ host: '0.0.0.0', port }, (err) => {
    if (err) throw err
    console.log(`listening on ${port}`)
    console.log(`DID endpoint: http://localhost:${port}/.well-known/nostr/did/<pubkey>.json`)
  })
}