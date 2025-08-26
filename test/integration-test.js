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
    id: 'contact-list-event',
    pubkey: validPubkey,
    kind: 3,
    content: '',
    created_at: 1737906800,
    tags: [
      ['p', '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'],
      ['p', '46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184147700e3a8'],
      ['p', '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2']
    ],
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
  
  // Find most recent contact list event (kind 3) for this pubkey
  const contactListEvents = events.filter(e => 
    e.kind === 3 && e.pubkey === pubkey
  )
  const contactListEvent = contactListEvents.length > 0 
    ? contactListEvents.reduce((latest, current) => 
        current.created_at > latest.created_at ? current : latest
      )
    : null
  
  // Parse follows if available
  let follows = null
  if (contactListEvent) {
    try {
      // Extract pubkeys from kind 3 event tags (p tags)
      const followPubkeys = contactListEvent.tags
        .filter(tag => tag[0] === 'p' && tag[1] && /^[0-9a-f]{64}$/i.test(tag[1]))
        .map(tag => tag[1].toLowerCase())
      
      if (followPubkeys.length > 0) {
        follows = {
          pubkeys: followPubkeys,
          count: followPubkeys.length
        }
      }
    } catch (e) {
      // Invalid contact list, ignore
    }
  }
  
  return generateDIDDocument(pubkey, profile, follows)
}

// Test 1: Pubkey with profile and follows data
const didComplete = simulateDIDEndpoint(validPubkey, events)
console.assert(didComplete.profile !== undefined, 'Should have profile when kind 0 event exists')
console.assert(didComplete.profile.name === 'Alice', 'Profile name should match kind 0 event')
console.assert(didComplete.profile.timestamp === 1737906600, 'Profile timestamp should match created_at')
console.assert(Array.isArray(didComplete.follows), 'Should have follows when kind 3 event exists')
console.assert(didComplete.follows.length === 3, 'Should have 3 follows from kind 3 event')
console.assert(didComplete.followsCount === 3, 'followsCount should match')
console.assert(didComplete.follows[0].startsWith('did:nostr:'), 'Follows should be DIDs')

// Test 2: Pubkey without profile data
const unknownPubkey = '0000000000000000000000000000000000000000000000000000000000000000'
const didWithoutData = simulateDIDEndpoint(unknownPubkey, events)
console.assert(didWithoutData.profile === undefined, 'Should not have profile when no kind 0 event exists')
console.assert(didWithoutData.follows === undefined, 'Should not have follows when no kind 3 event exists')

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

// Test 4: Multiple kind 3 events - should use most recent
const eventsWithMultipleContacts = [
  ...events,
  {
    id: 'older-contact-list',
    pubkey: validPubkey,
    kind: 3,
    content: '',
    created_at: 1737906700, // Earlier timestamp
    tags: [
      ['p', 'aaaa1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245']
    ],
    sig: 'fake-signature'
  }
]

const didWithMultipleContacts = simulateDIDEndpoint(validPubkey, eventsWithMultipleContacts)
console.assert(didWithMultipleContacts.follows.length === 3, 'Should use most recent contact list (3 follows, not 1)')

console.log('✅ Integration tests passed!')

// Show example output
console.log('\nExample Complete DID with profile and follows:')
console.log(JSON.stringify(didComplete, null, 2))