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
exports.OktaJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let OktaJwtGuard = class OktaJwtGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                console.log('❌ No Authorization header found');
                throw new common_1.UnauthorizedException('No authorization header');
            }
            if (!authHeader.startsWith('Bearer ')) {
                console.log('❌ Invalid authorization header format');
                throw new common_1.UnauthorizedException('Invalid authorization header format');
            }
            const token = authHeader.substring(7);
            if (!token) {
                console.log('❌ No token provided');
                throw new common_1.UnauthorizedException('No token provided');
            }
            console.log('🔍 Verifying Okta token...');
            const user = await this.authService.verifyOktaToken(token);
            request.user = user;
            console.log('✅ Okta authentication successful for:', user.email);
            return true;
        }
        catch (error) {
            console.error('❌ Okta JWT Guard - Authentication failed:', error.message);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.OktaJwtGuard = OktaJwtGuard;
exports.OktaJwtGuard = OktaJwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], OktaJwtGuard);
//# sourceMappingURL=okta-jwt.guard.js.map