import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    createAttendance(req: any, createAttendanceDto: CreateAttendanceDto): Promise<{
        success: boolean;
        message: string;
        data: ({
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
        })[];
    }>;
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
    getHistory(userId: string, filter: string): Promise<({
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
