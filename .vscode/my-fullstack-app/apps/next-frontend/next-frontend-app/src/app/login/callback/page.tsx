'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, CircularProgress, Typography, Alert, Container } from '@mui/material'

// This tells Next.js not to pre-render this page
export const dynamic = 'force-dynamic'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Check if Okta returned an error
        if (errorParam) {
          throw new Error(errorDescription || errorParam)
        }

        // Validate we have the required parameters
        if (!code) {
          throw new Error('No authorization code received from Okta')
        }

        // Validate state parameter (Cross Site Request Forgery[CSRF] protection)
        const savedState = sessionStorage.getItem('okta_state')
        if (state !== savedState) {
          throw new Error('Invalid state parameter - possible CSRF attack')
        }

        // Get the code verifier for PKCE
        const codeVerifier = sessionStorage.getItem('okta_code_verifier')
        if (!codeVerifier) {
          throw new Error('Code verifier not found - please try logging in again')
        }

        // Exchange authorization code for tokens
        const tokens = await exchangeCodeForTokens(code, codeVerifier)

        // Store the access token
        localStorage.setItem('token', tokens.access_token)
        if (tokens.id_token) {
          localStorage.setItem('id_token', tokens.id_token)
        }

        // Clean up session storage
        sessionStorage.removeItem('okta_state')
        sessionStorage.removeItem('okta_code_verifier')

        

        // Verify token with backend (optional but recommended)
        await verifyTokenWithBackend(tokens.access_token)

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err: any) {
        console.error('Okta callback error:', err)
        setError(err.message || 'Authentication failed')
        
        // Clean up session storage on error
        sessionStorage.removeItem('okta_state')
        sessionStorage.removeItem('okta_code_verifier')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3001)
      }
    }

    handleCallback()
  }, [searchParams, router])

  // Exchange authorization code for access token
  const exchangeCodeForTokens = async (code: string, codeVerifier: string) => {
    const oktaIssuer = process.env.NEXT_PUBLIC_OKTA_ISSUER
    const oktaClientId = process.env.NEXT_PUBLIC_OKTA_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI || 'http://localhost:3001/login/callback'

    if (!oktaIssuer || !oktaClientId) {
      throw new Error('Okta configuration is missing')
    }

    const tokenUrl = `${oktaIssuer}/v1/token`

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: oktaClientId,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error_description || 'Failed to exchange code for tokens')
    }

    const tokens = await response.json()
    return tokens
  }

  // Verify token with backend (optional)
  const verifyTokenWithBackend = async (accessToken: string) => {
    try {

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
      const response = await fetch(`${apiBase}/auth/verify-okta-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      })

      if (!response.ok) {
        throw new Error('Backend token verification failed')
      }

      const data = await response.json()
      console.log('Token verified with backend:', data)
      return data
    } catch (err) {
      console.warn('Backend verification failed, but continuing anyway:', err)
      // Don't throw error - token might be valid even if backend verification fails
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Redirecting to login page...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Completing sign in...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your credentials with Okta
            </Typography>
          </>
        )}
      </Box>
    </Container>
  )
}

export default function OktaCallbackPage() {
  return (
    <Suspense fallback={
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    }>
      <CallbackContent />
    </Suspense>
  )
}
