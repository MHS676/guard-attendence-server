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

    // 3. Resolve target user IDs: support single userId, batch userIds, or batch userEmails
    let targetUserIds: string[] = [];

    if (dto.userId) {
      targetUserIds = [dto.userId];
    } else if (dto.userIds && Array.isArray(dto.userIds) && dto.userIds.length > 0) {
      targetUserIds = dto.userIds;
    } else if (dto.userEmails && Array.isArray(dto.userEmails) && dto.userEmails.length > 0) {
      // 3a. Resolve emails to UUIDs
      console.log(`📧 [AttendanceService] Resolving emails to UUIDs:`, dto.userEmails);
      const usersFromEmails = await this.prisma.user.findMany({
        where: { email: { in: dto.userEmails } },
        select: { id: true, email: true, name: true },
      });

      if (usersFromEmails.length !== dto.userEmails.length) {
        const foundEmails = usersFromEmails.map((u) => u.email);
        const missingEmails = dto.userEmails.filter((e) => !foundEmails.includes(e));
        throw new NotFoundException(
          `One or more guard emails not found: ${missingEmails.join(', ')}`,
        );
      }

      targetUserIds = usersFromEmails.map((u) => u.id);
      console.log(`✅ [AttendanceService] Resolved ${targetUserIds.length} emails to UUIDs`);
    } else {
      throw new BadRequestException('Either userId, userIds, or userEmails must be provided.');
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

    console.log(`📝 [AttendanceService] Creating attendance for ${targetUserIds.length} users`);
    console.log(`   Date: ${dto.date}, Time: ${dto.time}, Post: ${dto.postId}`);
    console.log(`   Target User IDs: ${targetUserIds.join(', ')}`);

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

      console.log(`✅ [AttendanceService] Successfully created/updated ${results.length} records`);
      results.forEach((r, i) => {
        console.log(`   [${i + 1}] User: ${r.user?.name} (${r.userId}), Date: ${r.date}, Status: ${r.status}`);
      });

      // 6. Return created/updated attendance records with relations
      return results;
    } catch (error: any) {
      console.error('❌ [AttendanceService] Error marking attendance:', error);
      throw error;
    }
  }

  async getAttendanceHistory(userIdOrEmail: string, filter?: string) {
    try {
      // 1. Determine if input is a UUID or email
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userIdOrEmail,
      );

      let userId: string;

      if (isUUID) {
        // Input is already a UUID
        userId = userIdOrEmail;
      } else {
        // Input is an email - resolve to UUID
        console.log(`📧 [AttendanceService] Resolving email to UUID: ${userIdOrEmail}`);
        const user = await this.prisma.user.findUnique({
          where: { email: userIdOrEmail },
          select: { id: true },
        });

        if (!user) {
          throw new NotFoundException(`User with email ${userIdOrEmail} not found.`);
        }

        userId = user.id;
        console.log(`✅ [AttendanceService] Resolved email to UUID: ${userId}`);
      }

      // 2. Fetch ALL attendance records for this user (let frontend filter by month)
      // This ensures no data is lost due to filtering logic issues
      const whereClause: any = { userId };

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
        // Double check database
        const allCount = await this.prisma.attendance.count({
          where: { userId },
        });
        console.log(`🔔 [AttendanceService] Database has ${allCount} records total for this user`);
      } else {
        console.log(`✅ [AttendanceService] Sample record:`, JSON.stringify(records[0], null, 2));
      }

      return records;
    } catch (error) {
      console.error('❌ [AttendanceService] Error in getAttendanceHistory:', error);
      throw error;
    }
  }
}