import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(loginDto: LoginDto): Promise<{
        guardProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            postId: string | null;
            userCode: string | null;
            userId: string | null;
            mobile: string | null;
            designation: string | null;
            userRole: string | null;
            territory: string | null;
            joiningDate: Date | null;
            companyId: string | null;
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
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            employeeId: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            guardProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                postId: string | null;
                userCode: string | null;
                userId: string | null;
                mobile: string | null;
                designation: string | null;
                userRole: string | null;
                territory: string | null;
                joiningDate: Date | null;
                companyId: string | null;
            };
        };
    }>;
}
