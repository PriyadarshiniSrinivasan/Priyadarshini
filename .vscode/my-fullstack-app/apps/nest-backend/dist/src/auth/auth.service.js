"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const OktaJwtVerifier = require('@okta/jwt-verifier');
let AuthService = class AuthService {
    prisma;
    oktaJwtVerifier;
    constructor(prisma) {
        this.prisma = prisma;
        this.oktaJwtVerifier = new OktaJwtVerifier({
            issuer: process.env.OKTA_ISSUER || 'https://integrator-4261294.okta.com/oauth2/default',
            clientId: process.env.OKTA_CLIENT_ID || '0oaxisgknhpVfZfAP697',
            assertClaims: {
                aud: 'api://default',
                cid: process.env.OKTA_CLIENT_ID || '0oaxisgknhpVfZfAP697'
            }
        });
    }
    async verifyOktaToken(accessToken) {
        try {
            console.log('🔍 Verifying Okta JWT token...');
            const jwt = await this.oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default');
            console.log('✅ Okta token verified successfully');
            console.log('👤 User claims:', jwt.claims);
            const userInfo = {
                oktaId: jwt.claims.uid || jwt.claims.sub,
                email: jwt.claims.email || jwt.claims.sub,
                name: jwt.claims.name || jwt.claims.email || jwt.claims.sub,
                groups: jwt.claims.groups || [],
            };
            console.log('📧 Extracted user info:', userInfo);
            const user = await this.findOrCreateUser(userInfo);
            return user;
        }
        catch (error) {
            console.error('❌ Okta token verification failed:', error.message);
            throw new Error('Invalid Okta token');
        }
    }
    async findOrCreateUser(oktaUser) {
        try {
            let user = await this.prisma.user.findUnique({
                where: { email: oktaUser.email }
            });
            if (!user) {
                console.log('👤 Creating new user from Okta info:', oktaUser.email);
                user = await this.prisma.user.create({
                    data: {
                        email: oktaUser.email,
                        name: oktaUser.name,
                        password: 'OKTA_MANAGED',
                    }
                });
            }
            else {
                console.log('� Found existing user:', user.email);
                if (user.name !== oktaUser.name) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: { name: oktaUser.name }
                    });
                }
            }
            const { password: _, ...result } = user;
            return result;
        }
        catch (error) {
            console.error('❌ Error managing user:', error);
            throw new Error('User management error');
        }
    }
    async validateUser(email, password) {
        console.log('🔍 Validating user:', email);
        const user = await this.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            console.log('❌ User not found:', email);
            return null;
        }
        if (user.password === 'OKTA_MANAGED') {
            console.log('❌ User is Okta-managed, cannot use JWT login');
            return null;
        }
        const bcrypt = require('bcrypt');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return null;
        }
        console.log('✅ User validated successfully:', email);
        const { password: _, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map