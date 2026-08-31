import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and extracts user information
 * Token is sent via Authorization header as "Bearer <token>"
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-this',
    });
  }

  /**
   * Validates the JWT payload and returns user info
   * This is called after JWT is verified
   * Looks up the user in the attendance database by email to get their actual ID
   */
  async validate(payload: any) {
    // Look up user by email in the attendance database
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
