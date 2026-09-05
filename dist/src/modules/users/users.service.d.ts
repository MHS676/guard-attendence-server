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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        email: string | null;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        refreshToken: string | null;
        tokenVersion: number;
        isActive: boolean;
        supervisorId: string | null;
        postId: string | null;
    })[]>;
    findByRole(role: Role): Promise<{
        id: string;
        name: string;
        employeeId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
}
