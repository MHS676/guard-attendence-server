import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CrudGuard, CrudOperation } from '../auth/crud.guard';
import { Crud } from '../auth/crud.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard, CrudGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Crud(CrudOperation.READ)
  @Roles(Role.COORDINATOR, Role.SECURITY_IN_CHARGE, Role.SECURITY_SUPERVISOR, Role.CLIENT, Role.SECURITY_GUARD)
  async findAll() {
    return this.postsService.findAll();
  }

  @Post()
  @Crud(CrudOperation.CREATE)
  @Roles(Role.COORDINATOR, Role.SECURITY_IN_CHARGE)
  async create(@Body() body: CreatePostDto) {
    return this.postsService.create(body);
  }
}