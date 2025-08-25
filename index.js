import { validateEvent, verifySignature } from 'nostr-tools'
import fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { readFileSync } from 'fs'

const MAX_EVENTS = parseInt(process.env.MAX_EVENTS) || 1000  // Configurable max events to prevent memory exhaustion

function createServer ({ port, useHttps = false }) {
  const events = []
  const subscribers = new Map()

  const httpsOptions = useHttps
    ? {
        key: readFileSync('privkey.pem'),
        cert: readFileSync('fullchain.pem')
      }
    : undefined

  const fi = fastify({
    https: httpsOptions,
    http2: false
  })

  fi.register(fastifyWebsocket)
  fi.register(async function (fastify) {
    fastify.get('/', { websocket: true }, async (con, req) => {
      console.log('ws connection started')

      const { socket } = con
      console.log('ws connection established')

      socket.on('message', async (message) => {
        message = message?.toString()
        console.log('received message', message)

        const [type, value, ...rest] = JSON.parse(message)
        await processMessage(type, value, rest, socket, events, subscribers)
      })

      // ...
    })
  })

  fi.listen({ host: '0.0.0.0', port }, (err) => {
    if (err) throw err
    console.log(`listening on ${port}`)
  })
}

export const eventPassesFilter = (event, filter) => {
  // Standard Nostr filter fields (NIP-01)
  if (filter.ids && !filter.ids.includes(event.id)) {
    return false
  }
  
  if (filter.authors && !filter.authors.includes(event.pubkey)) {
    return false
  }
  
  if (filter.kinds && !filter.kinds.includes(event.kind)) {
    return false
  }
  
  if (filter.since && event.created_at < filter.since) {
    return false
  }
  
  if (filter.until && event.created_at > filter.until) {
    return false
  }
  
  // Tag filters (#e, #p, etc.)
  if (filter.tags) {
    for (const [tagName, tagValues] of Object.entries(filter.tags)) {
      const eventTagValues = event.tags
        .filter(tag => tag[0] === tagName.substring(1))
        .map(tag => tag[1])
      
      if (!tagValues.some(v => eventTagValues.includes(v))) {
        return false
      }
    }
  }
  
  // Keep existing custom filters for backward compatibility (optional)
  if (filter.from && event.from !== filter.from) {
    return false
  }
  
  if (filter.to && event.to !== filter.to) {
    return false
  }
  
  // Legacy support for single 'kind' (can remove if not needed)
  if (filter.kind && event.kind !== filter.kind) {
    return false
  }
  
  return true
}

function isReplaceableKind (kind) {
  return (kind >= 10000 && kind < 20000) || kind === 0 || kind === 3
}

function isEphemeralKind (kind) {
  return kind >= 20000 && kind < 30000
}

function isParameterizedReplaceable (kind) {
  return kind >= 30000 && kind < 40000
}

function getDTagValue (tags) {
  for (const tag of tags) {
    if (tag[0] === 'd') {
      return tag[1]
    }
  }
  return null
}

export const processMessage = async (type, value, rest, socket, events, subscribers) => {
  switch (type) {
    case 'EVENT':
      const ok = validateEvent(value)
      const veryOk = verifySignature(value)
      console.log('ok', ok, veryOk)
      if (ok && veryOk) {
        if (isEphemeralKind(value.kind)) {
          // Don't store the event, just process and forget
          // ... (rest of your processing logic)
        } else if (isReplaceableKind(value.kind) || isParameterizedReplaceable(value.kind)) {
          // Find and replace the previous event with the same pubkey and kind
          let indexToReplace = -1
          for (let i = 0; i < events.length; i++) {
            if (events[i].pubkey === value.pubkey && events[i].kind === value.kind) {
              if (isParameterizedReplaceable(value.kind)) {
                const dTagValue = getDTagValue(value.tags)
                const existingDTagValue = getDTagValue(events[i].tags)
                if (dTagValue === existingDTagValue) {
                  indexToReplace = i
                  break;
                }
              } else {
                indexToReplace = i
                break;
              }
            }
          }
          if (indexToReplace !== -1) {
            events[indexToReplace] = value
          } else {
            // Check memory cap before adding new event
            if (events.length >= MAX_EVENTS) {
              events.shift()  // Remove oldest event (FIFO)
            }
            events.push(value)
          }
          // ... (rest of your processing logic)
        } else {
          // Regular event, just add to the list
          // Check memory cap before adding new event
          if (events.length >= MAX_EVENTS) {
            events.shift()  // Remove oldest event (FIFO)
          }
          events.push(value)
          console.log('event ok')
          // ... (rest of your processing logic)
        }

        subscribers.forEach((filters, subscriber) => {
          filters.forEach(filter => {
            if (eventPassesFilter(value, filter)) {
              subscriber.send(JSON.stringify(['EVENT', filter.subscription_id, value]))
            }
          })
        })
        socket.send(`["OK", ${value.id}, true, ""]`)
      } else {
        socket.send('["NOTICE", "Invalid event"]')
      }
      break
    case 'REQ':
      console.log('REQ')
      const subscription_id = value
      const filters = rest.map(filter => ({ ...filter, subscription_id }))
      subscribers.set(socket, filters)

      filters.forEach(filter => {
        const matchingEvents = events.filter(event => eventPassesFilter(event, filter))
        const limited = filter.limit ? matchingEvents.slice(-filter.limit) : matchingEvents
        limited.forEach(event => socket.send(JSON.stringify(['EVENT', filter.subscription_id, event])))
      })

      socket.send(JSON.stringify(['EOSE', subscription_id]))
      break
    case 'CLOSE':
      const sub_id = value
      if (subscribers.has(socket)) {
        const updatedFilters = subscribers.get(socket).filter(filter => filter.subscription_id !== sub_id)
        if (updatedFilters.length === 0) {
          subscribers.delete(socket)
        } else {
          subscribers.set(socket, updatedFilters)
        }
      }
      break
    default:
      socket.send('["NOTICE", "Unrecognized event"]')
      console.log('Unrecognized event')
  }
}

// Compatibility with ES6 imports
export { createServer }

// Compatibility with CommonJS require
const exportsObject = { createServer }
if (typeof module !== 'undefined') {
  module.exports = exportsObject
}
