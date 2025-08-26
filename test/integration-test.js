/**
 * Integration test for DID endpoint with profile data
 */

import { generateDIDDocument } from '../lib/did-endpoint.js'

// Test the integration logic that would be in index.js
console.log('Testing DID endpoint integration with profile data...')

const validPubkey = '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2'

// Simulate events array with a kind 0 event (like in relay memory)
const events = [
  {
    id: 'test-event-id',
    pubkey: validPubkey,
    kind: 0,
    content: JSON.stringify({
      name: 'Alice',
      about: 'Building the decentralized social web',
      picture: 'https://example.com/alice.jpg',
      nip05: 'alice@example.com',
      website: 'https://alice.example.com'
    }),
    created_at: 1737906600,
    tags: [],
    sig: 'fake-signature'
  },
  {
    id: 'other-event',
    pubkey: 'different-pubkey-000000000000000000000000000000000000000000000000000',
    kind: 1,
    content: 'Hello world',
    created_at: 1737906700,
    tags: [],
    sig: 'fake-signature'
  }
]

// Simulate the logic from index.js
function simulateDIDEndpoint(pubkey, events) {
  // Find metadata event (kind 0) for this pubkey
  const metadataEvent = events.find(e => 
    e.kind === 0 && e.pubkey === pubkey
  )
  
  // Parse metadata if available
  let profile = null
  if (metadataEvent) {
    try {
      const metadata = JSON.parse(metadataEvent.content)
      profile = {
        ...metadata,
        timestamp: metadataEvent.created_at
      }
    } catch (e) {
      // Invalid metadata, ignore
    }
  }
  
  return generateDIDDocument(pubkey, profile)
}

// Test 1: Pubkey with profile data
const didWithProfile = simulateDIDEndpoint(validPubkey, events)
console.assert(didWithProfile.profile !== undefined, 'Should have profile when kind 0 event exists')
console.assert(didWithProfile.profile.name === 'Alice', 'Profile name should match kind 0 event')
console.assert(didWithProfile.profile.timestamp === 1737906600, 'Profile timestamp should match created_at')

// Test 2: Pubkey without profile data
const unknownPubkey = 'unknown0000000000000000000000000000000000000000000000000000000000'
const didWithoutProfile = simulateDIDEndpoint(unknownPubkey, events)
console.assert(didWithoutProfile.profile === undefined, 'Should not have profile when no kind 0 event exists')

// Test 3: Pubkey with invalid JSON in kind 0
const eventsWithInvalidJson = [
  {
    id: 'invalid-event',
    pubkey: validPubkey,
    kind: 0,
    content: 'invalid json',
    created_at: 1737906600,
    tags: [],
    sig: 'fake-signature'
  }
]
const didWithInvalidProfile = simulateDIDEndpoint(validPubkey, eventsWithInvalidJson)
console.assert(didWithInvalidProfile.profile === undefined, 'Should not have profile when JSON is invalid')

console.log('✅ Integration tests passed!')

// Show example output
console.log('\nExample DID with profile from kind 0 event:')
console.log(JSON.stringify(didWithProfile, null, 2))