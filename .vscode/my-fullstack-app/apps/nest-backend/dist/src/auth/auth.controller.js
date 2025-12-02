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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.LoginDto = exports.VerifyTokenDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const okta_jwt_guard_1 = require("./okta-jwt.guard");
class VerifyTokenDto {
    accessToken;
}
exports.VerifyTokenDto = VerifyTokenDto;
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async verifyOktaToken(verifyTokenDto) {
        try {
            console.log('🔍 Verifying Okta token via API endpoint...');
            const user = await this.authService.verifyOktaToken(verifyTokenDto.accessToken);
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                message: 'Okta token verified successfully'
            };
        }
        catch (error) {
            console.error('❌ Token verification failed:', error.message);
            throw new common_1.UnauthorizedException('Invalid Okta token');
        }
    }
    async getProfile(authHeader) {
        try {
            const token = authHeader?.substring(7);
            const user = await this.authService.verifyOktaToken(token);
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Unable to fetch profile');
        }
    }
    async login(loginDto) {
        console.log('🔐 JWT login attempt for:', loginDto.email);
        const { email, password } = loginDto;
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            console.log('❌ Invalid credentials for:', email);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        console.log('✅ User authenticated:', user.email);
        const jwt = require('jsonwebtoken');
        const payload = { sub: user.id, email: user.email };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: process.env.JWT_EXPIRES_IN || '2h'
        });
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('verify-okta-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify Okta Access Token',
        description: 'Validates an Okta access token and returns user information if the token is valid'
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired Okta token'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOktaToken", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(okta_jwt_guard_1.OktaJwtGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Current User Profile',
        description: 'Retrieves the authenticated user\'s profile information. Requires valid Okta JWT token in Authorization header.'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing token'
    }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'JWT Login (Legacy)',
        description: 'Traditional username/password authentication. Returns a JWT token for accessing protected endpoints. This is legacy - prefer Okta authentication for new implementations.'
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid email or password'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map