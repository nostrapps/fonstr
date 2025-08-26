/**
 * Basic CORS test using curl to verify headers
 */

import { spawn } from 'child_process'

const SERVER_URL = 'http://localhost:3000'
const TEST_PUBKEY = '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2'

console.log('CORS Test for DID Endpoints')
console.log('============================')

function runCurlTest(description, url, method = 'GET') {
  return new Promise((resolve, reject) => {
    console.log(`\n${description}`)
    console.log(`URL: ${url}`)
    console.log(`Method: ${method}`)
    
    const curl = spawn('curl', [
      '-I', // Headers only
      '-X', method,
      '-H', 'Origin: https://example.com', // Simulate cross-origin request
      url
    ])
    
    let output = ''
    
    curl.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    curl.stderr.on('data', (data) => {
      output += data.toString()
    })
    
    curl.on('close', (code) => {
      console.log(`Response Headers:`)
      console.log(output)
      
      // Check for CORS headers
      const hasAccessControlAllowOrigin = output.includes('Access-Control-Allow-Origin')
      const hasAccessControlAllowMethods = output.includes('Access-Control-Allow-Methods')
      
      if (hasAccessControlAllowOrigin && hasAccessControlAllowMethods) {
        console.log('✅ CORS headers present')
        resolve(true)
      } else {
        console.log('❌ Missing CORS headers')
        resolve(false)
      }
    })
    
    curl.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`)
      resolve(false)
    })
  })
}

async function runTests() {
  console.log('Starting CORS tests...')
  console.log('Make sure your fonstr server is running on port 3000')
  
  const tests = [
    {
      description: 'Test 1: Query Parameter Format - GET',
      url: `${SERVER_URL}/.well-known/did.json?pubkey=${TEST_PUBKEY}`,
      method: 'GET'
    },
    {
      description: 'Test 2: Query Parameter Format - OPTIONS',
      url: `${SERVER_URL}/.well-known/did.json`,
      method: 'OPTIONS'
    },
    {
      description: 'Test 3: Path Parameter Format - GET',
      url: `${SERVER_URL}/.well-known/did/nostr/${TEST_PUBKEY}.json`,
      method: 'GET'
    },
    {
      description: 'Test 4: Path Parameter Format - OPTIONS',
      url: `${SERVER_URL}/.well-known/did/nostr/${TEST_PUBKEY}.json`,
      method: 'OPTIONS'
    },
    {
      description: 'Test 5: Error Response CORS',
      url: `${SERVER_URL}/.well-known/did.json?pubkey=invalid`,
      method: 'GET'
    }
  ]
  
  let passCount = 0
  
  for (const test of tests) {
    const passed = await runCurlTest(test.description, test.url, test.method)
    if (passed) passCount++
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n============================`)
  console.log(`CORS Test Results: ${passCount}/${tests.length} passed`)
  
  if (passCount === tests.length) {
    console.log('🎉 All CORS tests passed!')
  } else {
    console.log('⚠️  Some CORS tests failed. Check server configuration.')
  }
}

// Run tests
runTests().catch(console.error)