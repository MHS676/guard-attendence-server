import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        company: {
            id: string;
            code: string;
            name: string;
        };
        users: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
    } & {
        id: string;
        code: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        territory: string | null;
        companyId: string;
        address: string | null;
        latitude: number;
        longitude: number;
    })[]>;
    create(data: CreatePostDto): Promise<{
        id: string;
        code: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        territory: string | null;
        companyId: string;
        address: string | null;
        latitude: number;
        longitude: number;
    }>;
}
