import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        supervisor: {
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
        employeeId: string;
        email: string | null;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        refreshToken: string | null;
        tokenVersion: number;
        isActive: boolean;
        supervisorId: string | null;
        postId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findByRole(role: Role): Promise<{
        id: string;
        employeeId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
}
