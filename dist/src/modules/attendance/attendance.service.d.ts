import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { User } from '@prisma/client';
export declare class AttendanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildCheckInTime;
    getAllAttendance(): Promise<({
        user: {
            id: string;
            employeeId: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        post: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        date: Date;
        checkInTime: Date;
        shiftHours: number;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        userId: string;
        markedById: string;
        postId: string;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    markAttendance(dto: CreateAttendanceDto, authenticatedUser: User): Promise<({
        user: {
            id: string;
            employeeId: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        post: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        date: Date;
        checkInTime: Date;
        shiftHours: number;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        userId: string;
        markedById: string;
        postId: string;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAttendanceHistory(userIdOrEmail: string, filter?: string): Promise<({
        user: {
            id: string;
            employeeId: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        post: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        date: Date;
        checkInTime: Date;
        shiftHours: number;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        userId: string;
        markedById: string;
        postId: string;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
