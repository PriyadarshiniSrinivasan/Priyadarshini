import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtGuard } from './jwt.guard'           // OLD: Legacy JWT guard
import { OktaJwtGuard } from './okta-jwt.guard' // NEW: Okta JWT guard
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,
    // Keep JwtModule for backward compatibility, but it's no longer used for Okta
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev',
      signOptions: { expiresIn: '24h' }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtGuard,      // OLD: Legacy JWT guard (kept for compatibility)
    OktaJwtGuard   // NEW: Okta JWT guard (recommended)
  ],
  exports: [
    AuthService,   // Export AuthService so OktaJwtGuard can use it in other modules
    JwtGuard,      // OLD: Export legacy guard for existing routes
    OktaJwtGuard,  // NEW: Export Okta guard for new routes  
    JwtModule
  ]
})
export class AuthModule {}

/**
 * MODULE EVOLUTION EXPLANATION:
 * 
 * BEFORE (JWT-only):
 * - Only had JwtGuard for local JWT token verification
 * - JwtModule configured with our secret key
 * - All authentication handled locally
 * 
 * NOW (Hybrid JWT + Okta):
 * - Added OktaJwtGuard for Okta token verification
 * - Kept old JwtGuard for backward compatibility
 * - AuthService now handles both local and Okta authentication
 * - Controllers have both legacy and new endpoints
 * 
 * MIGRATION PATH:
 * 1. Phase 1: Both systems work side-by-side
 * 2. Phase 2: Gradually migrate routes to use OktaJwtGuard
 * 3. Phase 3: Remove legacy JWT components once migration is complete
 * 
 * USAGE IN CONTROLLERS:
 * - Old way: @UseGuards(JwtGuard)
 * - New way: @UseGuards(OktaJwtGuard)
 */