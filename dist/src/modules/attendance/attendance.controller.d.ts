import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    createAttendance(req: any, createAttendanceDto: CreateAttendanceDto): Promise<{
        success: boolean;
        message: string;
        data: ({
            user: {
                id: string;
                employeeId: string;
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
            markedById: string | null;
            postId: string;
            captureLatitude: number | null;
            captureLongitude: number | null;
            captureAddress: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
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
        markedById: string | null;
        postId: string;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getHistory(userIdOrEmail: string, filter: string): Promise<({
        user: {
            id: string;
            employeeId: string;
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
        markedById: string | null;
        postId: string;
        captureLatitude: number | null;
        captureLongitude: number | null;
        captureAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
