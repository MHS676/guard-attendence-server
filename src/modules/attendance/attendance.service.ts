import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private buildCheckInTime(date: string, time: string) {
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

    return new Date(
      `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`,
    );
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

  /**
   * Mark attendance for one or multiple guards
   * Supports both single userId and batch userIds
   */
  async markAttendance(dto: CreateAttendanceDto, authenticatedUser: User) {
    // 1. Extract markedById from authenticated user
    const markedById = authenticatedUser.id;

    // 2. Verify that markedById user exists and is active
    const markedByUser = await this.prisma.user.findUnique({
      where: { id: markedById },
    });

    if (!markedByUser) {
      throw new NotFoundException('User marking attendance not found.');
    }

    if (!markedByUser.isActive) {
      throw new ForbiddenException('User marking attendance is inactive.');
    }

    // Permit Guards (self-check-in), Supervisors, Coordinators, and Security In-Charge
    const allowedRoles: Role[] = [
      Role.SECURITY_GUARD,
      Role.SECURITY_SUPERVISOR,
      Role.COORDINATOR,
      Role.SECURITY_IN_CHARGE,
    ];

    if (!allowedRoles.includes(markedByUser.role)) {
      throw new ForbiddenException('Unauthorized role for logging attendance.');
    }

    // 3. Resolve target user IDs: support both single userId and batch userIds
    let targetUserIds: string[] = [];

    if (dto.userId) {
      targetUserIds = [dto.userId];
    } else if (dto.userIds && Array.isArray(dto.userIds) && dto.userIds.length > 0) {
      targetUserIds = dto.userIds;
    } else {
      throw new BadRequestException('Either userId or userIds must be provided.');
    }

    // Prevent bulk operations for SECURITY_GUARD role (can only mark for themselves)
    if (markedByUser.role === Role.SECURITY_GUARD) {
      if (targetUserIds.length > 1 || targetUserIds[0] !== markedById) {
        throw new ForbiddenException(
          'Security guards can only mark attendance for themselves.',
        );
      }
    }

    // 4. Verify all target users exist and are active
    const targetUsers = await this.prisma.user.findMany({
      where: { id: { in: targetUserIds } },
    });

    if (targetUsers.length !== targetUserIds.length) {
      throw new NotFoundException(
        `One or more target guards not found. Expected ${targetUserIds.length}, found ${targetUsers.length}.`,
      );
    }

    const inactiveUsers = targetUsers.filter((u) => !u.isActive);
    if (inactiveUsers.length > 0) {
      throw new ForbiddenException(
        `One or more target guards are inactive: ${inactiveUsers.map((u) => u.name).join(', ')}`,
      );
    }

    // 5. Iterate through target guard IDs and construct/upsert attendance records
    const dateObj = new Date(dto.date);

    try {
      // Use transaction for atomic batch operations
      const results = await this.prisma.$transaction(
        targetUserIds.map((userId) =>
          this.prisma.attendance.upsert({
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
          }),
        ),
      );

      // 6. Return created/updated attendance records with relations
      console.log(`✅ [AttendanceService] Marked attendance for ${results.length} guard(s)`);
      return results;
    } catch (error: any) {
      console.error('❌ [AttendanceService] Error marking attendance:', error);
      throw error;
    }
  }

  async getAttendanceHistory(userId: string, filter?: string) {
    try {
      const whereClause: any = { userId };

      if (filter === 'month') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        whereClause.createdAt = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }

      const records = await this.prisma.attendance.findMany({
        where: whereClause,
        include: {
          post: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, employeeId: true, role: true } },
          markedBy: { select: { id: true, name: true, role: true } },
        },
        orderBy: { date: 'desc' },
      });

      return records;
    } catch (error) {
      console.error('❌ [AttendanceService] Error in getAttendanceHistory:', error);
      return [];
    }
  }
}