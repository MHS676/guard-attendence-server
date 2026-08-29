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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(prisma, configService) {
        const secret = configService.get('JWT_SECRET') || 'your-secret-key-here';
        console.log(`🔐 [JwtStrategy] Initialized with JWT_SECRET: "${secret}"`);
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.prisma = prisma;
        this.configService = configService;
    }
    async validate(payload) {
        console.log('🔑 [JwtStrategy] Successfully decoded token payload:', JSON.stringify(payload));
        console.log(`🔑 [JwtStrategy] Looking up user with ID: ${payload.sub}`);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { guardProfile: true },
        });
        if (!user) {
            console.warn(`⚠️ [JwtStrategy] User with ID ${payload.sub} NOT found in database.`);
            throw new common_1.UnauthorizedException('User not found in database');
        }
        console.log(`✅ [JwtStrategy] User found and validated: ${user.id} (${user.name})`);
        return user;
    }
    handleRequest(err, user, info) {
        if (err || !user) {
            console.error('❌ [JwtStrategy] handleRequest - JWT verification FAILED');
            if (err)
                console.error('  Error:', err.message || err);
            if (info)
                console.error('  Info:', info.message || info);
            throw err || new common_1.UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map