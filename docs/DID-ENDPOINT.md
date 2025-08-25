# Nostr DID Endpoint

This server now supports the Nostr DID Method specification, providing a `.well-known/did.json` endpoint for generating DID documents from Nostr public keys.

## Usage

### Request
```
GET /.well-known/did.json?pubkey={hex_public_key}
```

### Parameters
- `pubkey` (required): A 64-character hexadecimal Nostr public key

### Example Request
```bash
curl "http://localhost:3000/.well-known/did.json?pubkey=124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2"
```

### Example Response
```json
{
  "@context": [
    "https://w3id.org/did",
    "https://w3id.org/nostr/context"
  ],
  "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
  "verificationMethod": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1",
      "type": "Multikey",
      "controller": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
      "publicKeyMultibase": "fe70102124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2"
    }
  ],
  "authentication": ["#key1"],
  "assertionMethod": ["#key1"]
}
```

## Error Responses

### Missing Public Key
```json
{
  "error": "Missing pubkey parameter",
  "message": "Please provide a pubkey query parameter with a 64-character hex public key"
}
```

### Invalid Public Key Format
```json
{
  "error": "Invalid pubkey format",
  "message": "Public key must be a 64-character hexadecimal string"
}
```

## Implementation Details

- **Minimal Implementation**: This endpoint provides offline resolution without requiring relay queries
- **Multikey Format**: Uses W3C Multikey verification method with secp256k1 compressed public keys
- **Standards Compliance**: Follows the [Nostr DID Method Specification](https://nostrcg.github.io/did-nostr/)

## Testing

Run the included tests:
```bash
node test/did-endpoint.test.js
```

## Future Enhancements

- Enhanced resolution with relay service endpoints
- Support for npub format conversion
- Caching for frequently requested DIDs
- Batch DID document generation