import { AttendanceStatus } from '@prisma/client';
export declare class SingleAttendanceDto {
    userId: string;
    postId: string;
    date: string;
    time: string;
    shiftHours?: number;
    status?: AttendanceStatus;
    captureLatitude?: number;
    captureLongitude?: number;
    captureAddress?: string;
}
export declare class BatchAttendanceDto {
    userIds: string[];
    postId: string;
    date: string;
    time: string;
    shiftHours?: number;
    status?: AttendanceStatus;
    captureLatitude?: number;
    captureLongitude?: number;
    captureAddress?: string;
}
export declare class CreateAttendanceDto {
    userId?: string;
    userIds?: string[];
    postId: string;
    date: string;
    time: string;
    shiftHours?: number;
    status?: AttendanceStatus;
    captureLatitude?: number;
    captureLongitude?: number;
    captureAddress?: string;
}
