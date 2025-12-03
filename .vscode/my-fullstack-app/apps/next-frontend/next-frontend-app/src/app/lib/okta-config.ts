// Okta Configuration for Next.js Frontend
//import type { OktaAuthOptions } from '@okta/okta-auth-js'

// export const oktaConfig: OktaAuthOptions = {
//   // Okta Domain - Replace with your actual Okta domain
//   issuer: process.env.NEXT_PUBLIC_OKTA_ISSUER || 'https://dev-12345678.okta.com',
  
//   // Client ID from your Okta application
//   clientId: process.env.NEXT_PUBLIC_OKTA_CLIENT_ID || 'your-client-id-here',
  
//   // Redirect URI after successful login
//   redirectUri: process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI || 'http://localhost:3001/login/callback',
  
//   // Scopes - what information Okta should return
//   scopes: ['openid', 'profile', 'email'],
  
//   // PKCE (Proof Key for Code Exchange) - MUST be true for SPA
//   pkce: true,
  
//   // Response type - what we want Okta to return
//   responseType: ['code'],
  
//   // Force classic OAuth flow, not IDX
//   useClassicEngine: true
// } as any  // Type assertion to bypass TypeScript error

// Environment Variables Needed:
//  NEXT_PUBLIC_OKTA_ISSUER='https://your-domain.okta.com'
//  NEXT_PUBLIC_OKTA_CLIENT_ID='0oaxisgknhpVfZfAP697'
//  NEXT_PUBLIC_OKTA_REDIRECT_URI='http://localhost:3001/login/callback'