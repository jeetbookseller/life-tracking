import 'fake-indexeddb/auto'

// Polyfill Web Crypto API for Node.js test environment
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeCrypto = require('node:crypto')

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: nodeCrypto.webcrypto,
    writable: true,
  })
}
