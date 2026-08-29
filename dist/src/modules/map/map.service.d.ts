import { PrismaService } from '../prisma/prisma.service';
export declare class MapService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private formatCheckInTimestamp;
    getMapOverviewData(): Promise<{
        posts: {
            type: string;
            id: string;
            title: string;
            code: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        }[];
        activeGuards: {
            type: string;
            id: string;
            employeeName: string;
            employeeId: string;
            role: import(".prisma/client").$Enums.Role;
            postName: string;
            timestamp: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        }[];
    }>;
}
