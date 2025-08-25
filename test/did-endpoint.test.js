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

console.log('\n✅ All tests passed!')

// Output example DID document
console.log('\nExample DID Document:')
console.log(JSON.stringify(didDoc, null, 2))