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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const create_attendance_dto_1 = require("./dto/create-attendance.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const client_1 = require("@prisma/client");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async createAttendance(req, createAttendanceDto) {
        console.log(`📡 [AttendanceController] POST /attendance - Request from user: ${req.user.id}`);
        console.log(`📡 [AttendanceController] Payload:`, createAttendanceDto);
        try {
            const result = await this.attendanceService.markAttendance(createAttendanceDto, req.user);
            const recordCount = Array.isArray(result) ? result.length : 1;
            console.log(`✅ [AttendanceController] Successfully marked attendance for ${recordCount} guard(s)`);
            return {
                success: true,
                message: `Attendance marked for ${recordCount} guard(s)`,
                data: result,
            };
        }
        catch (error) {
            console.error(`❌ [AttendanceController] Error marking attendance:`, error.message);
            throw error;
        }
    }
    async getAllAttendance() {
        return this.attendanceService.getAllAttendance();
    }
    async getHistory(userId, filter) {
        console.log(`📡 [AttendanceController] GET /attendance/user/${userId} - Request received`);
        console.log(`📡 [AttendanceController] Filter: ${filter || 'none'}`);
        try {
            const result = await this.attendanceService.getAttendanceHistory(userId, filter);
            console.log(`✅ [AttendanceController] Successfully returned ${result?.length || 0} records`);
            return result;
        }
        catch (error) {
            console.error(`❌ [AttendanceController] Error fetching history:`, error);
            throw error;
        }
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(client_1.Role.SECURITY_GUARD, client_1.Role.SECURITY_SUPERVISOR, client_1.Role.COORDINATOR, client_1.Role.SECURITY_IN_CHARGE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_attendance_dto_1.CreateAttendanceDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "createAttendance", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(client_1.Role.SECURITY_SUPERVISOR, client_1.Role.COORDINATOR, client_1.Role.SECURITY_IN_CHARGE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAllAttendance", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_guard_1.Roles)(client_1.Role.SECURITY_GUARD, client_1.Role.SECURITY_SUPERVISOR, client_1.Role.COORDINATOR, client_1.Role.SECURITY_IN_CHARGE),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('filter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getHistory", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map