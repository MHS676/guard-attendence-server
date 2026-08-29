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
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(loginDto) {
        const { username, password } = loginDto;
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: username.toLowerCase() },
                    { employeeId: username },
                ],
            },
            include: {
                guardProfile: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = (await bcrypt.compare(password, user.password).catch(() => false)) ||
            user.password === password;
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto);
        const payload = {
            sub: user.id,
            email: user.email,
            employeeId: user.employeeId,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        console.log(`✅ [AuthService] Token signed for user: ${user.email}`);
        console.log(`   Token preview: ${token.substring(0, 50)}...`);
        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                employeeId: user.employeeId,
                name: user.name,
                role: user.role,
                guardProfile: user.guardProfile,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map