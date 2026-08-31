import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CrudGuard, CrudOperation } from '../auth/crud.guard';
import { Crud } from '../auth/crud.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, CrudGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Crud(CrudOperation.READ)
  @Roles(Role.COORDINATOR, Role.SECURITY_IN_CHARGE, Role.SECURITY_SUPERVISOR, Role.CLIENT)
  async findAll(@Query('role') role?: Role) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }
}