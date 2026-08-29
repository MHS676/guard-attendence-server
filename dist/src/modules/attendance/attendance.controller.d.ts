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
                name: string;
                id: string;
                employeeId: string;
                role: import(".prisma/client").$Enums.Role;
            };
            markedBy: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
            post: {
                name: string;
                id: string;
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
        })[];
    }>;
    getAllAttendance(): Promise<({
        user: {
            name: string;
            id: string;
            employeeId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        post: {
            name: string;
            id: string;
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
    getHistory(userId: string, filter: string): Promise<({
        user: {
            name: string;
            id: string;
            employeeId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        markedBy: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        post: {
            name: string;
            id: string;
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
