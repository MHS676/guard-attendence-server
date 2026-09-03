import { Controller, Post, Get, Body, Query, Param, Request, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CrudGuard, CrudOperation } from '../auth/crud.guard';
import { Crud } from '../auth/crud.decorator';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard, CrudGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Mark attendance for one or multiple guards
   * Requires: SECURITY_GUARD (self-check-in), SECURITY_SUPERVISOR, COORDINATOR, or SECURITY_IN_CHARGE
   * CRUD: CREATE (all roles can create their own or assigned attendance)
   */
  @Post()
  @Crud(CrudOperation.CREATE)
  @Roles(Role.SECURITY_GUARD, Role.SECURITY_SUPERVISOR, Role.COORDINATOR, Role.SECURITY_IN_CHARGE, Role.CLIENT)
  async createAttendance(@Request() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    console.log(`📡 [AttendanceController] POST /attendance - Request from user: ${req.user.id} (${req.user.role})`);
    console.log(`📡 [AttendanceController] Payload:`, createAttendanceDto);

    try {
      const result = await this.attendanceService.markAttendance(
        createAttendanceDto,
        req.user,
      );

      const recordCount = Array.isArray(result) ? result.length : 1;
      console.log(
        `✅ [AttendanceController] Successfully marked attendance for ${recordCount} guard(s)`,
      );

      return {
        success: true,
        message: `Attendance marked for ${recordCount} guard(s)`,
        data: result,
      };
    } catch (error: any) {
      console.error(`❌ [AttendanceController] Error marking attendance:`, error.message);
      throw error;
    }
  }

  @Get()
  @Crud(CrudOperation.READ)
  @Roles(Role.COORDINATOR, Role.SECURITY_IN_CHARGE)
  async getAllAttendance() {
    return this.attendanceService.getAllAttendance();
  }

  @Get('user/:userIdOrEmail')
  @Crud(CrudOperation.READ)
  @Roles(Role.SECURITY_GUARD, Role.SECURITY_SUPERVISOR, Role.COORDINATOR, Role.SECURITY_IN_CHARGE, Role.CLIENT)
  async getHistory(
    @Param('userIdOrEmail') userIdOrEmail: string,
    @Query('filter') filter: string,
  ) {
    console.log(`📡 [AttendanceController] GET /attendance/user/${userIdOrEmail} - Request received`);
    console.log(`📡 [AttendanceController] Filter: ${filter || 'none'}`);
    try {
      const result = await this.attendanceService.getAttendanceHistory(userIdOrEmail, filter);
      console.log(`✅ [AttendanceController] Successfully returned ${result?.length || 0} records`);
      if (result?.length > 0) {
        console.log(`📋 [AttendanceController] Sample record:`, JSON.stringify(result[0], null, 2));
      }
      return result;
    } catch (error) {
      console.error(`❌ [AttendanceController] Error fetching history:`, error);
      throw error;
    }
  }
}