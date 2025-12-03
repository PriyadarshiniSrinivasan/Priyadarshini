'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  Avatar,
  CircularProgress,
  Divider
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // NEW: OKTA AUTHENTICATION
  // ============================================================================

  const handleOktaLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get Okta configuration from environment variables
      const oktaIssuer = process.env.NEXT_PUBLIC_OKTA_ISSUER
      const oktaClientId = process.env.NEXT_PUBLIC_OKTA_CLIENT_ID
      const redirectUri = process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI || 'http://localhost:3001/login/callback'

      // Validate configuration
      if (!oktaIssuer || !oktaClientId) {
        throw new Error('Okta configuration is missing. Please check your .env.local file.')
      }

      // Generate state parameter for security (prevents CSRF attacks)
      const state = Math.random().toString(36).substring(7)
      sessionStorage.setItem('okta_state', state)

      // Generate PKCE code verifier and challenge (for enhanced security)
      const codeVerifier = generateCodeVerifier()
      sessionStorage.setItem('okta_code_verifier', codeVerifier)
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      // Build Okta authorization URL
      const authUrl = new URL(`${oktaIssuer}/v1/authorize`)
      authUrl.searchParams.append('client_id', oktaClientId)
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('scope', 'openid profile email')
      authUrl.searchParams.append('redirect_uri', redirectUri)
      authUrl.searchParams.append('state', state)
      authUrl.searchParams.append('code_challenge_method', 'S256')
      authUrl.searchParams.append('code_challenge', codeChallenge)

      // Redirect user to Okta login page
      window.location.href = authUrl.toString()
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Okta login')
      setLoading(false)
    }
  }

  // Helper function to generate PKCE code verifier
  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return base64URLEncode(array)
  }

  // Helper function to generate PKCE code challenge
  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return base64URLEncode(new Uint8Array(hash))
  }

  // Helper function for base64 URL encoding
  const base64URLEncode = (buffer: Uint8Array): string => {
    const base64 = btoa(String.fromCharCode(...buffer))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // ============================================================================
  // OLD: JWT AUTHENTICATION (COMMENTED OUT - KEPT FOR REFERENCE)
  // ============================================================================
  
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  
  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError(null)

  //   try {
  //     const response = await apiFetch('/auth/login', {
  //       method: 'POST',
  //       body: JSON.stringify({ email, password }),
  //     })

  //     const data = await response.json()

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Login failed')
  //     }

  //     // Store JWT token
  //     localStorage.setItem('token', data.access_token)
      
  //     // Redirect to dashboard
  //     router.push('/dashboard')
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to connect to server. Please try again.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Paper elevation={3} sx={{ mt: 3, p: 4, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* NEW: Okta Login Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleOktaLogin}
            disabled={loading}
            sx={{ 
              mt: 2, 
              mb: 2,
              bgcolor: '#007dc1',
              '&:hover': {
                bgcolor: '#005a8c'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in with Okta'}
          </Button>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Typography variant="body2" color="text.secondary" align="center">
            Continue with your organization's Okta account
          </Typography>

          {/* OLD: JWT Login Form (COMMENTED OUT)
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
          */}
        </Paper>
      </Box>
    </Container>
  )
}
