/**
 * Nostr DID Document Generator
 * Implements minimal DID document generation per https://nostrcg.github.io/did-nostr/
 */

/**
 * Generates a minimal DID document from a Nostr public key
 * @param {string} pubkey - 64-character hex public key
 * @returns {object} DID document
 */
export function generateDIDDocument(pubkey) {
  // Validate pubkey format
  if (!pubkey || typeof pubkey !== 'string' || !/^[0-9a-f]{64}$/i.test(pubkey)) {
    throw new Error('Invalid public key: must be 64-character hex string')
  }
  
  // Normalize to lowercase
  const normalizedPubkey = pubkey.toLowerCase()
  
  // Generate Multikey representation
  // 1. Add 0x02 prefix for compressed secp256k1 (even y-coordinate default)
  // 2. Add multicodec varint for secp256k1-pub (0xe7, 0x01)
  // 3. Encode with base16-lower (f prefix)
  const publicKeyMultibase = 'fe70102' + normalizedPubkey
  
  // Construct DID
  const did = `did:nostr:${normalizedPubkey}`
  
  // Generate minimal DID document
  const didDocument = {
    '@context': [
      'https://w3id.org/did',
      'https://w3id.org/nostr/context'
    ],
    id: did,
    verificationMethod: [
      {
        id: `${did}#key1`,
        type: 'Multikey',
        controller: did,
        publicKeyMultibase: publicKeyMultibase
      }
    ],
    authentication: ['#key1'],
    assertionMethod: ['#key1']
  }
  
  return didDocument
}

/**
 * Validates a hex public key
 * @param {string} pubkey - Public key to validate
 * @returns {boolean} True if valid
 */
export function isValidPubkey(pubkey) {
  if (!pubkey || typeof pubkey !== 'string') {
    return false
  }
  return /^[0-9a-f]{64}$/i.test(pubkey)
}