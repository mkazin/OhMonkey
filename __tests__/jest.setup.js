// TextEncoder and TextDecoder are not available in Node.js by default
// and are required for jsdom.
// In production code, these would be available in the browser environment,
// but for testing we need to polyfill them.
const TextEncoder = require('util').TextEncoder;
const TextDecoder = require('util').TextDecoder;

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
// This polyfill ensures that the randomUUID function is available in all environments
window.crypto.randomUUID = window.crypto.randomUUID ?  window.crypto.randomUUID : crypto.randomUUID ? crypto.randomUUID : () => ObserverTracker.generateRandomUUID()
