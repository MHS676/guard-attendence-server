import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
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
        address: string | null;
        territory: string | null;
        latitude: number;
        longitude: number;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(body: CreatePostDto): Promise<{
        id: string;
        code: string;
        name: string;
        address: string | null;
        territory: string | null;
        latitude: number;
        longitude: number;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
