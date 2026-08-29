import { MapService } from './map.service';
export declare class MapController {
    private readonly mapService;
    constructor(mapService: MapService);
    getMapOverview(): Promise<{
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
