import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: Role) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }
}