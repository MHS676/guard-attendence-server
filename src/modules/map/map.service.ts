import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  private formatCheckInTimestamp(date: Date, checkInTime: Date) {
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
}
