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
exports.MapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MapService = class MapService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatCheckInTimestamp(date, checkInTime) {
        const datePart = date.toISOString().split('T')[0];
        const hours = checkInTime.getUTCHours();
        const minutes = checkInTime.getUTCMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${datePart} ${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    }
    async getMapOverviewData() {
        const posts = await this.prisma.post.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                latitude: true,
                longitude: true,
            },
        });
        const recentAttendances = await this.prisma.attendance.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            distinct: ['userId'],
            select: {
                id: true,
                captureLatitude: true,
                captureLongitude: true,
                date: true,
                checkInTime: true,
                user: {
                    select: { id: true, name: true, employeeId: true, role: true },
                },
                post: {
                    select: { name: true },
                },
            },
        });
        return {
            posts: posts.map((p) => ({
                type: 'POST',
                id: p.id,
                title: p.name,
                code: p.code,
                coordinates: { lat: p.latitude, lng: p.longitude },
            })),
            activeGuards: recentAttendances.map((a) => ({
                type: 'GUARD_CHECKIN',
                id: a.id,
                employeeName: a.user.name,
                employeeId: a.user.employeeId,
                role: a.user.role,
                postName: a.post.name,
                timestamp: this.formatCheckInTimestamp(a.date, a.checkInTime),
                coordinates: { lat: a.captureLatitude, lng: a.captureLongitude },
            })),
        };
    }
};
exports.MapService = MapService;
exports.MapService = MapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MapService);
//# sourceMappingURL=map.service.js.map