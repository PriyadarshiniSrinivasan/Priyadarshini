import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Headers,
  UnauthorizedException,
  UseGuards 
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { OktaJwtGuard } from './okta-jwt.guard'

export class VerifyTokenDto {
  accessToken: string
}

/**
 * LEGACY: Old username/password login DTO
 * Kept for backward compatibility but deprecated
 */
export class LoginDto {
  email: string
  password: string
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * NEW: Verify Okta Token Endpoint
   * 
   * This endpoint receives an Okta access token from the frontend
   * and verifies it, returning user information if valid
   */
  @Post('verify-okta-token')
  @ApiOperation({ 
    summary: 'Verify Okta Access Token',
    description: 'Validates an Okta access token and returns user information if the token is valid'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Okta access token received from Okta authentication flow',
          example: 'eyJraWQiOiJxMnZkVG1...'
        }
      },
      required: ['accessToken']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' }
          }
        },
        message: { type: 'string', example: 'Okta token verified successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired Okta token' 
  })
  async verifyOktaToken(@Body() verifyTokenDto: VerifyTokenDto) {
    try {
      console.log('🔍 Verifying Okta token via API endpoint...')
      
      // Verify the Okta token
      const user = await this.authService.verifyOktaToken(verifyTokenDto.accessToken)
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        message: 'Okta token verified successfully'
      }
      
    } catch (error) {
      console.error('❌ Token verification failed:', error.message)
      throw new UnauthorizedException('Invalid Okta token')
    }
  }

  /**
   * NEW: Get Current User Profile (Protected Route)
   * 
   * This demonstrates how to use the OktaJwtGuard to protect routes
   * The guard will automatically verify the Okta token from the Authorization header
   */
  @Get('profile')
  @UseGuards(OktaJwtGuard)  // This protects the route with Okta authentication
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get Current User Profile',
    description: 'Retrieves the authenticated user\'s profile information. Requires valid Okta JWT token in Authorization header.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  async getProfile(@Headers('authorization') authHeader: string) {
    // The OktaJwtGuard has already verified the token and added user to the request
    // In a real implementation, you'd use a custom decorator to get the user
    
    try {
      // Extract token from header
      const token = authHeader?.substring(7) // Remove "Bearer "
      const user = await this.authService.verifyOktaToken(token)
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      throw new UnauthorizedException('Unable to fetch profile')
    }
  }

  /**
   * JWT Login Endpoint
   * 
   * This endpoint receives email/password and returns a JWT token
   */
  @Post('login')
  @ApiOperation({ 
    summary: 'JWT Login (Legacy)',
    description: 'Traditional username/password authentication. Returns a JWT token for accessing protected endpoints. This is legacy - prefer Okta authentication for new implementations.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'user@example.com'
        },
        password: {
          type: 'string',
          format: 'password',
          description: 'User password',
          example: 'securePassword123'
        }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { 
          type: 'string', 
          description: 'JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid email or password' 
  })
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 JWT login attempt for:', loginDto.email)
    
    const { email, password } = loginDto
    
    // Validate user credentials
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      console.log('❌ Invalid credentials for:', email)
      throw new UnauthorizedException('Invalid email or password')
    }
    
    console.log('✅ User authenticated:', user.email)
    
    // Generate JWT token
    const jwt = require('jsonwebtoken')
    const payload = { sub: user.id, email: user.email }
    const access_token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h'
    })
    
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  }
}

/**
 * KEY DIFFERENCES BETWEEN OLD AND NEW AUTHENTICATION:
 * 
 * OLD JWT AUTHENTICATION:
 * 1. POST /auth/login with username/password
 * 2. Server validates credentials against database
 * 3. Server generates JWT token with our secret key
 * 4. Client stores token and sends it with each request
 * 5. Server verifies token with our secret key
 * 
 * NEW OKTA AUTHENTICATION:
 * 1. Client redirects to Okta for authentication
 * 2. User logs in with Okta (handles MFA, password policies, etc.)
 * 3. Okta redirects back with authorization code
 * 4. Client exchanges code for Okta access token
 * 5. Client sends Okta token to our API
 * 6. Server verifies token with Okta's public keys
 * 7. Server trusts Okta's authentication and gets user info
 * 
 * BENEFITS OF OKTA:
 * - Single Sign-On (SSO) across multiple applications
 * - Multi-Factor Authentication (MFA) built-in
 * - Enterprise password policies
 * - Centralized user management
 * - Better security compliance
 * - No need to store/manage passwords
 * - Automatic token refresh
 * - Integration with corporate directories (Active Directory, LDAP)
 */