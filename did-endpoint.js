// DID Nostr REST API implementation for fonstr
// Serves DID documents at /.well-known/nostr/did/<pubkey>.json

/**
 * Convert hex pubkey to multibase encoded Multikey format
 * @param {string} pubkey - 64-char hex pubkey
 * @returns {string} multibase encoded key
 */
function pubkeyToMultikey(pubkey) {
  // Add compressed pubkey prefix (0x02 for even y-coordinate)
  const compressed = '02' + pubkey
  // Add multicodec varint for secp256k1 (0xe7, 0x01)
  const withCodec = 'e701' + compressed
  // Add multibase base16-lower prefix 'f'
  return 'f' + withCodec
}

/**
 * Generate DID Document from pubkey and optional metadata
 * @param {string} pubkey - 64-char hex pubkey
 * @param {Object} metadata - Optional kind 0 event data
 * @param {Array} relays - Known relay endpoints
 * @returns {Object} DID Document
 */
export function generateDIDDocument(pubkey, metadata = null, relays = []) {
  const did = `did:nostr:${pubkey}`
  
  const doc = {
    '@context': ['https://w3id.org/did', 'https://w3id.org/nostr/context'],
    id: did,
    verificationMethod: [
      {
        id: `${did}#key1`,
        type: 'Multikey',
        controller: did,
        publicKeyMultibase: pubkeyToMultikey(pubkey)
      }
    ],
    authentication: ['#key1'],
    assertionMethod: ['#key1']
  }
  
  // Add relay services if available
  if (relays.length > 0) {
    doc.service = relays.map((relay, index) => ({
      id: `${did}#relay${index + 1}`,
      type: 'Relay',
      serviceEndpoint: relay
    }))
  }
  
  // Add metadata if available (from kind 0 events)
  if (metadata) {
    doc.alsoKnownAs = []
    if (metadata.name) {
      doc.alsoKnownAs.push(`nostr:${metadata.name}`)
    }
    if (metadata.nip05) {
      doc.alsoKnownAs.push(`nostr-nip05:${metadata.nip05}`)
    }
  }
  
  return doc
}

/**
 * Add DID REST endpoint to Fastify server
 * @param {Object} fastify - Fastify instance
 * @param {Array} events - Events array from relay
 */
export function addDIDEndpoint(fastify, events) {
  // Serve DID documents at /.well-known/nostr/did/<pubkey>.json
  fastify.get('/.well-known/nostr/did/:pubkey.json', async (request, reply) => {
    const { pubkey } = request.params
    
    // Validate pubkey format (64 hex chars)
    if (!/^[0-9a-f]{64}$/.test(pubkey)) {
      return reply.code(400).send({ error: 'Invalid pubkey format' })
    }
    
    // Find metadata event (kind 0) for this pubkey
    const metadataEvent = events.find(e => 
      e.kind === 0 && 
      e.pubkey === pubkey
    )
    
    // Parse metadata if available
    let metadata = null
    if (metadataEvent) {
      try {
        metadata = JSON.parse(metadataEvent.content)
      } catch (e) {
        // Invalid metadata, ignore
      }
    }
    
    // Get unique relays from events by this pubkey
    const userEvents = events.filter(e => e.pubkey === pubkey)
    const relaySet = new Set()
    
    // In a real implementation, you'd track which relays events came from
    // For now, we'll use default relays
    const defaultRelays = [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band'
    ]
    defaultRelays.forEach(r => relaySet.add(r))
    
    // Generate DID document
    const didDoc = generateDIDDocument(
      pubkey,
      metadata,
      Array.from(relaySet)
    )
    
    // Set proper headers
    reply
      .code(200)
      .header('Content-Type', 'application/json')
      .header('Access-Control-Allow-Origin', '*')
      .send(didDoc)
  })
  
  // Also support /.well-known/did/nostr/<pubkey>.json for compatibility
  fastify.get('/.well-known/did/nostr/:pubkey.json', async (request, reply) => {
    // Redirect to canonical path
    reply.redirect(301, `/.well-known/nostr/did/${request.params.pubkey}.json`)
  })
}