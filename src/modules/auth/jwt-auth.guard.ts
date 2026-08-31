import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Validates incoming JWT tokens from the Authorization header
 * Decodes and attaches user info to req.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
