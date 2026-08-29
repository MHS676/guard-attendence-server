import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.post.findMany({
      include: {
        users: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async create(data: CreatePostDto) {
    return this.prisma.post.create({ data });
  }
}