import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: Role): Promise<{
        id: string;
        name: string;
        employeeId: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
}
