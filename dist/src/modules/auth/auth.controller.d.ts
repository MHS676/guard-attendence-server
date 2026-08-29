import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
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
    debugToken(req: any): Promise<{
        message: string;
        user: any;
        headers: {
            authorization: string;
        };
    }>;
    verifyToken(body: {
        token: string;
    }): Promise<{
        message: string;
        decoded: any;
        secret: string;
        error?: undefined;
        hint?: undefined;
    } | {
        message: string;
        error: any;
        secret: string;
        hint: string;
        decoded?: undefined;
    }>;
}
