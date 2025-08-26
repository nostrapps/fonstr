/**
 * Nostr DID Document Generator
 * Implements minimal DID document generation per https://nostrcg.github.io/did-nostr/
 */

/**
 * Generates a DID document from a Nostr public key with optional profile and follows
 * @param {string} pubkey - 64-character hex public key
 * @param {object} profile - Optional profile object with user data
 * @param {object} follows - Optional follows object with social graph data
 * @returns {object} DID document
 */
export function generateDIDDocument(pubkey, profile = null, follows = null) {
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
  
  // Generate DID document
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
  
  // Add profile if provided
  if (profile && typeof profile === 'object') {
    didDocument.profile = {}
    
    // Standard profile fields from the spec
    if (profile.name && typeof profile.name === 'string') {
      didDocument.profile.name = profile.name
    }
    if (profile.about && typeof profile.about === 'string') {
      didDocument.profile.about = profile.about
    }
    if (profile.picture && typeof profile.picture === 'string') {
      didDocument.profile.picture = profile.picture
    }
    if (profile.nip05 && typeof profile.nip05 === 'string') {
      didDocument.profile.nip05 = profile.nip05
    }
    if (profile.lud16 && typeof profile.lud16 === 'string') {
      didDocument.profile.lud16 = profile.lud16
    }
    if (profile.website && typeof profile.website === 'string') {
      didDocument.profile.website = profile.website
    }
    if (profile.timestamp && typeof profile.timestamp === 'number') {
      didDocument.profile.timestamp = profile.timestamp
    }
    
    // Remove profile if empty
    if (Object.keys(didDocument.profile).length === 0) {
      delete didDocument.profile
    }
  }
  
  // Add follows if provided (social graph from kind 3 events)
  if (follows && typeof follows === 'object') {
    // Add follows array - convert pubkeys to DIDs
    if (Array.isArray(follows.pubkeys) && follows.pubkeys.length > 0) {
      didDocument.follows = follows.pubkeys
        .filter(pk => typeof pk === 'string' && /^[0-9a-f]{64}$/i.test(pk))
        .map(pk => `did:nostr:${pk.toLowerCase()}`)
      
      // Remove follows if empty after filtering
      if (didDocument.follows.length === 0) {
        delete didDocument.follows
      }
    }
    
    // Add followsCount if provided
    if (typeof follows.count === 'number' && follows.count > 0) {
      didDocument.followsCount = follows.count
    }
    
    // Add service endpoint for complete follows if truncated
    if (follows.truncated && follows.serviceEndpoint) {
      if (!didDocument.service) {
        didDocument.service = []
      }
      didDocument.service.push({
        id: `${did}#follows-api`,
        type: 'FollowsEndpoint',
        serviceEndpoint: follows.serviceEndpoint
      })
    }
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