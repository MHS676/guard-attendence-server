import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { User } from '@prisma/client';
export declare class AttendanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildCheckInTime;
    getAllAttendance(): Promise<({
        post: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            employeeId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        postId: string;
        userId: string;
        date: Date;
        shiftHours: number;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        checkInTime: Date;
        markedById: string;
    })[]>;
    markAttendance(dto: CreateAttendanceDto, authenticatedUser: User): Promise<({
        post: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            employeeId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        postId: string;
        userId: string;
        date: Date;
        shiftHours: number;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        checkInTime: Date;
        markedById: string;
    })[]>;
    getAttendanceHistory(userId: string, filter?: string): Promise<({
        post: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            employeeId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        postId: string;
        userId: string;
        date: Date;
        shiftHours: number;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        checkInTime: Date;
        markedById: string;
    })[]>;
}
