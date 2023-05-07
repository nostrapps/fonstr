#!/usr/bin/env node

import fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { validateEvent, verifySignature } from 'nostr-tools'

const port = process.argv[2] || 4444

const events = []
const subscribers = new Map()

const fi = fastify()

fi.register(fastifyWebsocket)
fi.register(async function (fastify) {
  fastify.get('/', { websocket: true }, async (con, req) => {
    console.log('ws connection started')

    const { socket } = con
    console.log('ws connection established')

    const eventPassesFilter = (event, filter) => {
      const { types, kind, from, to } = filter

      if (types && !types.includes(event.type)) {
        return false
      }

      if (kind && event.kind !== kind) {
        return false
      }

      if (from && event.from !== from) {
        return false
      }

      if (to && event.to !== to) {
        return false
      }

      return true
    }

    socket.on('message', async message => {
      message = message?.toString()
      console.log('received message', message)

      const [type, value, ...rest] = JSON.parse(message)
      switch (type) {
        case 'EVENT':
          const ok = validateEvent(value)
          const veryOk = verifySignature(value)
          console.log('ok', ok, veryOk)
          if (ok && veryOk) { // Validate the event using nostr-tools
            events.push(value)
            console.log('event ok')
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
            events.filter(event => eventPassesFilter(event, filter))
              .forEach(event => socket.send(JSON.stringify(['EVENT', filter.subscription_id, event])))
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
        // ...
      }
    })

    // ...
  })
})

fi.listen({ host: '0.0.0.0', port }, err => {
  if (err) throw err
  console.log(`listening on ${port}`)
})
