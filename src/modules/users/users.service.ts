import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        post: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async findByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role },
      select: { id: true, name: true, employeeId: true, role: true },
    });
  }
}