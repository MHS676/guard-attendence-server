import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log(`🔐 [JwtAuthGuard] Checking authorization for: ${request.method} ${request.path}`);
    console.log(`🔐 [JwtAuthGuard] Authorization header: ${authHeader ? 'Present' : 'MISSING'}`);
    if (authHeader) {
      const tokenPreview = authHeader.substring(0, 50) + (authHeader.length > 50 ? '...' : '');
      console.log(`🔐 [JwtAuthGuard] Token preview: ${tokenPreview}`);
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    console.log(`🔐 [JwtAuthGuard] handleRequest called`);
    if (err) console.error(`  ❌ Error:`, err.message);
    if (info) console.error(`  ❌ Info:`, info.message || info);
    if (user) console.log(`  ✅ User authenticated: ${user.id}`);

    return super.handleRequest(err, user, info, context, status);
  }
}