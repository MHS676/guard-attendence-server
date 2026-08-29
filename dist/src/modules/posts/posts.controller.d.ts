import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    findAll(): Promise<({
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
    create(body: CreatePostDto): Promise<{
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
