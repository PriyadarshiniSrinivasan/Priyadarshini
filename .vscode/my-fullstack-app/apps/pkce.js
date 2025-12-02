// pkce.js
const crypto = require('crypto');

// Generate code_verifier (random string, URL-safe)
const code_verifier = crypto.randomBytes(64).toString('base64url');

// Generate code_challenge (SHA-256 of verifier, URL-safe)
const code_challenge = crypto
  .createHash('sha256')
  .update(code_verifier)
  .digest('base64url');

console.log('code_verifier:', code_verifier);
console.log('code_challenge:', code_challenge);