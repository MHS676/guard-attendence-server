import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key-here';
    console.log(`🔐 [JwtStrategy] Initialized with JWT_SECRET: "${secret}"`);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('🔑 [JwtStrategy] Successfully decoded token payload:', JSON.stringify(payload));
    console.log(`🔑 [JwtStrategy] Looking up user with ID: ${payload.sub}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { guardProfile: true },
    });

    if (!user) {
      console.warn(`⚠️ [JwtStrategy] User with ID ${payload.sub} NOT found in database.`);
      throw new UnauthorizedException('User not found in database');
    }

    console.log(`✅ [JwtStrategy] User found and validated: ${user.id} (${user.name})`);
    return user;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('❌ [JwtStrategy] handleRequest - JWT verification FAILED');
      if (err) console.error('  Error:', err.message || err);
      if (info) console.error('  Info:', info.message || info);
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}