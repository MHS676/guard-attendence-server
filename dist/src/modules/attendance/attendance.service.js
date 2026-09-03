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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AttendanceService = class AttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildCheckInTime(date, time) {
        const match = time.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if (!match) {
            return new Date(`${date}T00:00:00.000Z`);
        }
        let [, hoursText, minutesText, meridiem] = match;
        let hours = Number(hoursText);
        const minutes = Number(minutesText);
        if (meridiem) {
            const normalizedMeridiem = meridiem.toUpperCase();
            if (normalizedMeridiem === 'AM' && hours === 12) {
                hours = 0;
            }
            if (normalizedMeridiem === 'PM' && hours < 12) {
                hours += 12;
            }
        }
        return new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);
    }
    async getAllAttendance() {
        return this.prisma.attendance.findMany({
            include: {
                user: { select: { id: true, name: true, employeeId: true, role: true } },
                post: { select: { id: true, name: true } },
                markedBy: { select: { id: true, name: true, role: true } },
            },
            orderBy: { checkInTime: 'desc' },
        });
    }
    async markAttendance(dto, authenticatedUser) {
        const markedById = authenticatedUser.id;
        const markedByUser = await this.prisma.user.findUnique({
            where: { id: markedById },
        });
        if (!markedByUser) {
            throw new common_1.NotFoundException('User marking attendance not found.');
        }
        if (!markedByUser.isActive) {
            throw new common_1.ForbiddenException('User marking attendance is inactive.');
        }
        const allowedRoles = [
            client_1.Role.SECURITY_GUARD,
            client_1.Role.SECURITY_SUPERVISOR,
            client_1.Role.COORDINATOR,
            client_1.Role.SECURITY_IN_CHARGE,
        ];
        if (!allowedRoles.includes(markedByUser.role)) {
            throw new common_1.ForbiddenException('Unauthorized role for logging attendance.');
        }
        let targetUserIds = [];
        if (dto.userId) {
            targetUserIds = [dto.userId];
        }
        else if (dto.userIds && Array.isArray(dto.userIds) && dto.userIds.length > 0) {
            targetUserIds = dto.userIds;
        }
        else if (dto.userEmails && Array.isArray(dto.userEmails) && dto.userEmails.length > 0) {
            console.log(`📧 [AttendanceService] Resolving emails to UUIDs:`, dto.userEmails);
            const usersFromEmails = await this.prisma.user.findMany({
                where: { email: { in: dto.userEmails } },
                select: { id: true, email: true, name: true },
            });
            if (usersFromEmails.length !== dto.userEmails.length) {
                const foundEmails = usersFromEmails.map((u) => u.email);
                const missingEmails = dto.userEmails.filter((e) => !foundEmails.includes(e));
                throw new common_1.NotFoundException(`One or more guard emails not found: ${missingEmails.join(', ')}`);
            }
            targetUserIds = usersFromEmails.map((u) => u.id);
            console.log(`✅ [AttendanceService] Resolved ${targetUserIds.length} emails to UUIDs`);
        }
        else {
            throw new common_1.BadRequestException('Either userId, userIds, or userEmails must be provided.');
        }
        if (markedByUser.role === client_1.Role.SECURITY_GUARD) {
            if (targetUserIds.length > 1 || targetUserIds[0] !== markedById) {
                throw new common_1.ForbiddenException('Security guards can only mark attendance for themselves.');
            }
        }
        const targetUsers = await this.prisma.user.findMany({
            where: { id: { in: targetUserIds } },
        });
        if (targetUsers.length !== targetUserIds.length) {
            throw new common_1.NotFoundException(`One or more target guards not found. Expected ${targetUserIds.length}, found ${targetUsers.length}.`);
        }
        const inactiveUsers = targetUsers.filter((u) => !u.isActive);
        if (inactiveUsers.length > 0) {
            throw new common_1.ForbiddenException(`One or more target guards are inactive: ${inactiveUsers.map((u) => u.name).join(', ')}`);
        }
        const dateObj = new Date(dto.date);
        console.log(`📝 [AttendanceService] Creating attendance for ${targetUserIds.length} users`);
        console.log(`   Date: ${dto.date}, Time: ${dto.time}, Post: ${dto.postId}`);
        console.log(`   Target User IDs: ${targetUserIds.join(', ')}`);
        try {
            const results = await this.prisma.$transaction(targetUserIds.map((userId) => this.prisma.attendance.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: dateObj,
                    },
                },
                create: {
                    userId,
                    markedById,
                    postId: dto.postId,
                    date: dateObj,
                    checkInTime: this.buildCheckInTime(dto.date, dto.time),
                    shiftHours: dto.shiftHours || 8,
                    status: dto.status || 'PRESENT',
                    captureLatitude: dto.captureLatitude,
                    captureLongitude: dto.captureLongitude,
                    captureAddress: dto.captureAddress,
                },
                update: {
                    markedById,
                    postId: dto.postId,
                    checkInTime: this.buildCheckInTime(dto.date, dto.time),
                    shiftHours: dto.shiftHours || 8,
                    status: dto.status || 'PRESENT',
                    captureLatitude: dto.captureLatitude,
                    captureLongitude: dto.captureLongitude,
                    captureAddress: dto.captureAddress,
                },
                include: {
                    user: { select: { id: true, name: true, employeeId: true, role: true } },
                    post: { select: { id: true, name: true } },
                    markedBy: { select: { id: true, name: true, role: true } },
                },
            })));
            console.log(`✅ [AttendanceService] Successfully created/updated ${results.length} records`);
            results.forEach((r, i) => {
                console.log(`   [${i + 1}] User: ${r.user?.name} (${r.userId}), Date: ${r.date}, Status: ${r.status}`);
            });
            return results;
        }
        catch (error) {
            console.error('❌ [AttendanceService] Error marking attendance:', error);
            throw error;
        }
    }
    async getAttendanceHistory(userIdOrEmail, filter) {
        try {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail);
            let userId;
            if (isUUID) {
                userId = userIdOrEmail;
            }
            else {
                console.log(`📧 [AttendanceService] Resolving email to UUID: ${userIdOrEmail}`);
                const user = await this.prisma.user.findUnique({
                    where: { email: userIdOrEmail },
                    select: { id: true },
                });
                if (!user) {
                    throw new common_1.NotFoundException(`User with email ${userIdOrEmail} not found.`);
                }
                userId = user.id;
                console.log(`✅ [AttendanceService] Resolved email to UUID: ${userId}`);
            }
            const whereClause = { userId };
            console.log(`🔍 [AttendanceService] Fetching attendance for user: ${userId} (filter: ${filter || 'none'})`);
            const records = await this.prisma.attendance.findMany({
                where: whereClause,
                include: {
                    post: { select: { id: true, name: true } },
                    user: { select: { id: true, name: true, employeeId: true, role: true } },
                    markedBy: { select: { id: true, name: true, role: true } },
                },
                orderBy: { date: 'desc' },
            });
            console.log(`📊 [AttendanceService] Found ${records.length} total records for ${userIdOrEmail}`);
            if (records.length === 0) {
                console.warn(`⚠️ [AttendanceService] No records found for user ${userIdOrEmail}`);
                const allCount = await this.prisma.attendance.count({
                    where: { userId },
                });
                console.log(`🔔 [AttendanceService] Database has ${allCount} records total for this user`);
            }
            else {
                console.log(`✅ [AttendanceService] Sample record:`, JSON.stringify(records[0], null, 2));
            }
            return records;
        }
        catch (error) {
            console.error('❌ [AttendanceService] Error in getAttendanceHistory:', error);
            throw error;
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map