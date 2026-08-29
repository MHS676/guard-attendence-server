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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const result = await this.authService.login(loginDto);
        console.log('✅ [AuthController] Login successful, returning token');
        return result;
    }
    async debugToken(req) {
        console.log('🔍 [AuthController] DEBUG: Token accepted, user:', req.user?.id);
        return {
            message: 'Token is valid!',
            user: req.user,
            headers: {
                authorization: req.headers.authorization ? 'Present' : 'Missing',
            },
        };
    }
    async verifyToken(body) {
        if (!body.token) {
            throw new common_1.BadRequestException('Token required in request body');
        }
        try {
            const secret = process.env.JWT_SECRET || 'super-secret-key';
            console.log(`🔍 [AuthController] Attempting to verify token with SECRET: "${secret}"`);
            const decoded = this.jwtService.verify(body.token, { secret });
            console.log('✅ [AuthController] Token verification successful:', JSON.stringify(decoded));
            return {
                message: 'Token is valid!',
                decoded,
                secret: `Using: "${secret}"`,
            };
        }
        catch (error) {
            console.error('❌ [AuthController] Token verification failed:', error.message);
            return {
                message: 'Token is INVALID!',
                error: error.message,
                secret: `Using: "${process.env.JWT_SECRET || 'super-secret-key'}"`,
                hint: 'Token may be: expired, malformed, signed with different secret, or not a JWT at all',
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('debug/token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "debugToken", null);
__decorate([
    (0, common_1.Post)('debug/verify-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map