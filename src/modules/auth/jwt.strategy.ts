import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and extracts user information
 * Token is sent via Authorization header as "Bearer <token>"
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-this',
    });
  }

  /**
   * Validates the JWT payload and returns user info
   * This is called after JWT is verified
   */
  validate(payload: any) {
    return {
      id: payload.sub || payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
