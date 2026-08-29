import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    validate(payload: any): Promise<{
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
    handleRequest(err: any, user: any, info: any): any;
}
export {};
