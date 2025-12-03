import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
const OktaJwtVerifier = require('@okta/jwt-verifier')

@Injectable()
export class AuthService {
  private oktaJwtVerifier: any

  constructor(private prisma: PrismaService) {
    // Initialize Okta JWT Verifier
    // This validates JWT tokens issued by Okta
    this.oktaJwtVerifier = new OktaJwtVerifier({
      // Your Okta domain's issuer URL
      issuer: process.env.OKTA_ISSUER || 'https://integrator-4261294.okta.com/oauth2/default',
      
      // Your Okta application's Client ID  
      clientId: process.env.OKTA_CLIENT_ID || '0oaxisgknhpVfZfAP697',
      
      // Accept the default audience claim from Okta
      assertClaims: {
        aud: 'api://default',  // Accept the default Okta audience
        cid: process.env.OKTA_CLIENT_ID || '0oaxisgknhpVfZfAP697'
      }
    })
  }

  /**
   * NEW: Verify Okta JWT token
   * This replaces the old validateUser method
   * Instead of checking username/password, we verify the JWT token from Okta
   */
  async verifyOktaToken(accessToken: string) {
    try {
      console.log('🔍 Verifying Okta JWT token...')
      
      // Ask Okta JWT Verifier: "Is this token valid?"
      // Don't pass expected audience - let it use the one from config
      const jwt = await this.oktaJwtVerifier.verifyAccessToken(
        accessToken, 
        'api://default'  // Expected audience for Okta default authorization server
      )
      
      console.log('✅ Okta token verified successfully')
      console.log('👤 User claims:', jwt.claims)
      
      // Extract user information from the JWT claims
      // Note: Okta puts the email in 'sub' claim by default
      const userInfo = {
        oktaId: jwt.claims.uid || jwt.claims.sub,     // Okta user ID
        email: jwt.claims.email || jwt.claims.sub,    // User's email (fallback to sub if email not present)
        name: jwt.claims.name || jwt.claims.email || jwt.claims.sub, // User's name
        groups: jwt.claims.groups || [], // User's groups/roles
      }
      
      console.log('📧 Extracted user info:', userInfo)
      
      // Optional: Create or update user in our database
      const user = await this.findOrCreateUser(userInfo)
      
      return user
      
    } catch (error) {
      console.error('❌ Okta token verification failed:', error.message)
      throw new Error('Invalid Okta token')
    }
  }

  /**
   * Find existing user or create new one based on Okta info
   * This synchronizes Okta users with our local database
   */
  private async findOrCreateUser(oktaUser: any) {
    try {
      // Check if user already exists in our database
      let user = await this.prisma.user.findUnique({
        where: { email: oktaUser.email }
      })

      if (!user) {
        console.log('👤 Creating new user from Okta info:', oktaUser.email)
        
        // Create new user in our database
        user = await this.prisma.user.create({
          data: {
            email: oktaUser.email,
            name: oktaUser.name,
            // No password needed - Okta handles authentication
            password: 'OKTA_MANAGED', // Placeholder indicating Okta manages auth
          }
        })
      } else {
        console.log('� Found existing user:', user.email)
        
        // Optional: Update user info if it changed in Okta
        if (user.name !== oktaUser.name) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { name: oktaUser.name }
          })
        }
      }

      // Return user without password
      const { password: _, ...result } = user
      return result
      
    } catch (error) {
      console.error('❌ Error managing user:', error)
      throw new Error('User management error')
    }
  }

  /**
   * Validate user credentials for JWT authentication
   */
  async validateUser(email: string, password: string) {
    console.log('🔍 Validating user:', email)
    
    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return null
    }

    if (user.password === 'OKTA_MANAGED') {
      console.log('❌ User is Okta-managed, cannot use JWT login')
      return null
    }

    // Compare password with bcrypt
    const bcrypt = require('bcrypt')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email)
      return null
    }

    console.log('✅ User validated successfully:', email)
    const { password: _, ...result } = user
    return result
  }
}