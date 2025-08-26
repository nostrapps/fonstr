/**
 * Tests for DID endpoint functionality
 */

import { generateDIDDocument, isValidPubkey } from '../lib/did-endpoint.js'

// Test data
const validPubkey = '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2'
const invalidPubkeys = [
  '',
  null,
  undefined,
  '123',  // Too short
  '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd',  // 63 chars
  '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd22',  // 65 chars
  'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',  // Invalid hex
  '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd!',  // Invalid char
]

// Test pubkey validation
console.log('Testing pubkey validation...')
console.assert(isValidPubkey(validPubkey) === true, 'Valid pubkey should return true')
invalidPubkeys.forEach(pubkey => {
  console.assert(isValidPubkey(pubkey) === false, `Invalid pubkey "${pubkey}" should return false`)
})
console.log('✓ Pubkey validation tests passed')

// Test DID document generation
console.log('\nTesting DID document generation...')
const didDoc = generateDIDDocument(validPubkey)

// Check structure
console.assert(didDoc['@context'] !== undefined, 'DID document should have @context')
console.assert(Array.isArray(didDoc['@context']), '@context should be an array')
console.assert(didDoc['@context'].includes('https://w3id.org/did'), '@context should include DID context')
console.assert(didDoc['@context'].includes('https://w3id.org/nostr/context'), '@context should include Nostr context')

// Check ID
const expectedDid = `did:nostr:${validPubkey.toLowerCase()}`
console.assert(didDoc.id === expectedDid, `DID should be ${expectedDid}`)

// Check verification method
console.assert(Array.isArray(didDoc.verificationMethod), 'verificationMethod should be an array')
console.assert(didDoc.verificationMethod.length === 1, 'Should have one verification method')

const vm = didDoc.verificationMethod[0]
console.assert(vm.id === `${expectedDid}#key1`, 'Verification method ID should be correct')
console.assert(vm.type === 'Multikey', 'Verification method type should be Multikey')
console.assert(vm.controller === expectedDid, 'Controller should be the DID')

// Check multibase encoding
const expectedMultibase = 'fe70102' + validPubkey.toLowerCase()
console.assert(vm.publicKeyMultibase === expectedMultibase, 'publicKeyMultibase should be correctly encoded')

// Check authentication and assertion
console.assert(Array.isArray(didDoc.authentication), 'authentication should be an array')
console.assert(didDoc.authentication.includes('#key1'), 'authentication should reference #key1')
console.assert(Array.isArray(didDoc.assertionMethod), 'assertionMethod should be an array')
console.assert(didDoc.assertionMethod.includes('#key1'), 'assertionMethod should reference #key1')

console.log('✓ DID document generation tests passed')

// Test error handling
console.log('\nTesting error handling...')
invalidPubkeys.forEach(pubkey => {
  try {
    generateDIDDocument(pubkey)
    console.assert(false, `Should throw error for invalid pubkey "${pubkey}"`)
  } catch (error) {
    console.assert(error.message.includes('Invalid public key'), 'Error message should mention invalid public key')
  }
})
console.log('✓ Error handling tests passed')

// Test profile functionality
console.log('\nTesting profile functionality...')

// Test with valid profile
const profileData = {
  name: 'Alice',
  about: 'Building the decentralized social web',
  picture: 'https://example.com/alice.jpg',
  nip05: 'alice@example.com',
  lud16: 'alice@getalby.com',
  website: 'https://alice.example.com',
  timestamp: 1737906600
}

const didDocWithProfile = generateDIDDocument(validPubkey, profileData)
console.assert(didDocWithProfile.profile !== undefined, 'DID document should have profile field')
console.assert(didDocWithProfile.profile.name === 'Alice', 'Profile name should match')
console.assert(didDocWithProfile.profile.about === 'Building the decentralized social web', 'Profile about should match')
console.assert(didDocWithProfile.profile.picture === 'https://example.com/alice.jpg', 'Profile picture should match')
console.assert(didDocWithProfile.profile.nip05 === 'alice@example.com', 'Profile nip05 should match')
console.assert(didDocWithProfile.profile.lud16 === 'alice@getalby.com', 'Profile lud16 should match')
console.assert(didDocWithProfile.profile.website === 'https://alice.example.com', 'Profile website should match')
console.assert(didDocWithProfile.profile.timestamp === 1737906600, 'Profile timestamp should match')

// Test with partial profile
const partialProfile = { name: 'Bob' }
const didDocPartial = generateDIDDocument(validPubkey, partialProfile)
console.assert(didDocPartial.profile.name === 'Bob', 'Partial profile name should match')
console.assert(didDocPartial.profile.about === undefined, 'Partial profile should not have undefined fields')

// Test with empty profile
const emptyProfile = {}
const didDocEmpty = generateDIDDocument(validPubkey, emptyProfile)
console.assert(didDocEmpty.profile === undefined, 'Empty profile should be removed')

// Test with invalid profile data types
const invalidProfile = { name: 123, about: null, timestamp: 'invalid' }
const didDocInvalid = generateDIDDocument(validPubkey, invalidProfile)
console.assert(didDocInvalid.profile === undefined, 'Invalid profile data should result in no profile')

// Test without profile (backward compatibility)
const didDocNoProfile = generateDIDDocument(validPubkey)
console.assert(didDocNoProfile.profile === undefined, 'DID document without profile should work')

console.log('✓ Profile functionality tests passed')

// Test follows functionality
console.log('\nTesting follows functionality...')

// Test with valid follows
const followsData = {
  pubkeys: [
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
    '46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184147700e3a8'
  ],
  count: 2
}

const didDocWithFollows = generateDIDDocument(validPubkey, null, followsData)
console.assert(Array.isArray(didDocWithFollows.follows), 'DID document should have follows array')
console.assert(didDocWithFollows.follows.length === 2, 'Should have 2 follows')
console.assert(didDocWithFollows.follows[0].startsWith('did:nostr:'), 'Follows should be DIDs')
console.assert(didDocWithFollows.followsCount === 2, 'followsCount should match')

// Test with complete DID document (profile + follows)
const didDocComplete = generateDIDDocument(validPubkey, profileData, followsData)
console.assert(didDocComplete.profile !== undefined, 'Complete DID should have profile')
console.assert(Array.isArray(didDocComplete.follows), 'Complete DID should have follows')
console.assert(didDocComplete.followsCount === 2, 'Complete DID should have followsCount')

// Test with invalid pubkeys in follows (should filter out)
const invalidFollowsData = {
  pubkeys: [
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // valid
    'invalid-pubkey', // invalid
    '46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184147700e3a8'  // valid
  ],
  count: 3
}

const didDocFiltered = generateDIDDocument(validPubkey, null, invalidFollowsData)
console.assert(didDocFiltered.follows.length === 2, 'Should filter out invalid pubkeys')
console.assert(didDocFiltered.followsCount === 3, 'followsCount should preserve original count')

// Test with empty follows
const emptyFollowsData = { pubkeys: [], count: 0 }
const didDocEmptyFollows = generateDIDDocument(validPubkey, null, emptyFollowsData)
console.assert(didDocEmptyFollows.follows === undefined, 'Empty follows should be removed')
console.assert(didDocEmptyFollows.followsCount === undefined, 'Empty followsCount should be removed')

// Test with truncated follows and service endpoint
const truncatedFollowsData = {
  pubkeys: [
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
    '46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184147700e3a8'
  ],
  count: 5234,
  truncated: true,
  serviceEndpoint: 'https://api.example.com/did/follows/{did}'
}

const didDocTruncated = generateDIDDocument(validPubkey, null, truncatedFollowsData)
console.assert(didDocTruncated.follows.length === 2, 'Should include truncated follows')
console.assert(didDocTruncated.followsCount === 5234, 'Should show total count')
console.assert(Array.isArray(didDocTruncated.service), 'Should have service array')
console.assert(didDocTruncated.service.some(s => s.type === 'FollowsEndpoint'), 'Should have FollowsEndpoint service')

console.log('✓ Follows functionality tests passed')

console.log('\n✅ All tests passed!')

// Output example DID documents
console.log('\nExample Minimal DID Document:')
console.log(JSON.stringify(didDoc, null, 2))

console.log('\nExample DID Document with Profile:')
console.log(JSON.stringify(didDocWithProfile, null, 2))

console.log('\nExample Complete DID Document (Profile + Follows):')
console.log(JSON.stringify(didDocComplete, null, 2))