import { Body, Controller, HttpCode, HttpStatus, Post, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    console.log('✅ [AuthController] Login successful, returning token');
    return result;
  }

  @Get('debug/token')
  @UseGuards(JwtAuthGuard)
  async debugToken(@Request() req: any) {
    console.log('🔍 [AuthController] DEBUG: Token accepted, user:', req.user?.id);
    return {
      message: 'Token is valid!',
      user: req.user,
      headers: {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
      },
    };
  }

  @Post('debug/verify-token')
  async verifyToken(@Body() body: { token: string }) {
    if (!body.token) {
      throw new BadRequestException('Token required in request body');
    }

    try {
      const secret = process.env.JWT_SECRET || 'super-secret-key';
      console.log(`🔍 [AuthController] Attempting to verify token with SECRET: "${secret}"`);
      
      const decoded = this.jwtService.verify(body.token, { secret });
      console.log('✅ [AuthController] Token verification successful:', JSON.stringify(decoded));
      
      return {
        message: 'Token is valid!',
        decoded,
        secret: `Using: "${secret}"`,
      };
    } catch (error: any) {
      console.error('❌ [AuthController] Token verification failed:', error.message);
      return {
        message: 'Token is INVALID!',
        error: error.message,
        secret: `Using: "${process.env.JWT_SECRET || 'super-secret-key'}"`,
        hint: 'Token may be: expired, malformed, signed with different secret, or not a JWT at all',
      };
    }
  }
}
