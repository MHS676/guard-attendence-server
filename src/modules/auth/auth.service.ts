import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: username.toLowerCase() },
          { employeeId: username },
        ],
      },
      include: {
        guardProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid =
      (await bcrypt.compare(password, user.password).catch(() => false)) ||
      user.password === password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);

    const payload = {
      sub: user.id,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    console.log(`✅ [AuthService] Token signed for user: ${user.email}`);
    console.log(`   Token preview: ${token.substring(0, 50)}...`);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        guardProfile: user.guardProfile,
      },
    };
  }
}
