import { Controller, Post, Get, Body, Query, Param, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Mark attendance for one or multiple guards
   * Requires: SECURITY_GUARD (self-check-in), SECURITY_SUPERVISOR, COORDINATOR, or SECURITY_IN_CHARGE
   */
  @Post()
  async createAttendance(@Request() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    console.log(`📡 [AttendanceController] POST /attendance - Request from user: ${req.user.id}`);
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
  async getAllAttendance() {
    return this.attendanceService.getAllAttendance();
  }

  @Get('user/:userId')
  async getHistory(
    @Param('userId') userId: string,
    @Query('filter') filter: string,
  ) {
    console.log(`📡 [AttendanceController] GET /attendance/user/${userId} - Request received`);
    console.log(`📡 [AttendanceController] Filter: ${filter || 'none'}`);
    try {
      const result = await this.attendanceService.getAttendanceHistory(userId, filter);
      console.log(`✅ [AttendanceController] Successfully returned ${result?.length || 0} records`);
      return result;
    } catch (error) {
      console.error(`❌ [AttendanceController] Error fetching history:`, error);
      throw error;
    }
  }
}