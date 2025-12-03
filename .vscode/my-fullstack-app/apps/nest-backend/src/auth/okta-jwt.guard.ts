import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

/**
 * Okta JWT Guard - Protects routes with Okta authentication
 * 
 * This guard replaces the old JWT guard and works with Okta tokens
 * instead of locally-generated JWT tokens
 */
@Injectable()
export class OktaJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    
    try {
      // Extract the Authorization header
      const authHeader = request.headers.authorization
      
      if (!authHeader) {
        console.log('❌ No Authorization header found')
        throw new UnauthorizedException('No authorization header')
      }

      // Check if it's a Bearer token
      if (!authHeader.startsWith('Bearer ')) {
        console.log('❌ Invalid authorization header format')
        throw new UnauthorizedException('Invalid authorization header format')
      }

      // Extract the actual token (remove "Bearer " prefix)
      const token = authHeader.substring(7)
      
      if (!token) {
        console.log('❌ No token provided')
        throw new UnauthorizedException('No token provided')
      }

      console.log('🔍 Verifying Okta token...')
      
      // Verify the Okta token using our AuthService
      const user = await this.authService.verifyOktaToken(token)
      
      // Add user information to the request object
      // This makes user info available in route handlers
      request.user = user
      
      console.log('✅ Okta authentication successful for:', user.email)
      return true
      
    } catch (error) {
      console.error('❌ Okta JWT Guard - Authentication failed:', error.message)
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}

/**
 * DIFFERENCES FROM OLD JWT GUARD:
 * 
 * OLD JWT Guard:
 * - Verified locally-generated JWT tokens
 * - Used our own JWT secret key
 * - Checked token signature against our secret
 * - Limited to our application only
 * 
 * NEW Okta JWT Guard:
 * - Verifies tokens issued by Okta's servers
 * - Uses Okta's public keys for verification
 * - Validates token against Okta's issuer
 * - Works across multiple applications (SSO)
 * - Includes additional security checks (audience, issuer, etc.)
 * - Automatically handles token expiration
 * - Supports Okta's security features (MFA, conditional access, etc.)
 */