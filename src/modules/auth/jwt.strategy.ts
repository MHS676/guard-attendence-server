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
   * Token is issued by MDB-auth-server and contains user info
   * We trust the token payload directly without requiring user to exist in attendance DB
   */
  async validate(payload: any) {
    console.log(`✅ [JwtStrategy] Token validated for user:`, payload.email, `role:`, payload.role);
    
    // Trust the JWT payload directly (token was signed by MDB-auth-server)
    // This allows users from the auth system to access attendance records
    return {
      id: payload.sub || payload.id || payload.email, // Use subject, id, or email as user ID
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
