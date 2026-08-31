import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export enum CrudOperation {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * CRUD Permission Matrix by Role
 * Defines which roles can perform which operations
 */
const CRUD_PERMISSIONS: Record<Role, Set<CrudOperation>> = {
  [Role.COORDINATOR]: new Set([
    CrudOperation.CREATE,
    CrudOperation.READ,
    CrudOperation.UPDATE,
    CrudOperation.DELETE,
  ]),
  [Role.CLIENT]: new Set([
    CrudOperation.READ, // Can view their posts/guards/attendance
  ]),
  [Role.SECURITY_IN_CHARGE]: new Set([
    CrudOperation.CREATE, // Can create attendance records
    CrudOperation.READ,
    CrudOperation.UPDATE, // Can update attendance
    CrudOperation.DELETE, // Can delete their records
  ]),
  [Role.SECURITY_SUPERVISOR]: new Set([
    CrudOperation.CREATE, // Can create attendance records
    CrudOperation.READ,
    CrudOperation.UPDATE, // Can update attendance
    CrudOperation.DELETE, // Can delete their records
  ]),
  [Role.SECURITY_GUARD]: new Set([
    CrudOperation.CREATE, // Can create their own attendance
    CrudOperation.READ, // Can read their own records
  ]),
};

@Injectable()
export class CrudGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredOperation = this.reflector.get<CrudOperation>(
      'crudOperation',
      context.getHandler(),
    );

    if (!requiredOperation) {
      // No CRUD operation specified, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole: Role = user.role as Role;
    const allowedOperations = CRUD_PERMISSIONS[userRole];

    if (!allowedOperations || !allowedOperations.has(requiredOperation)) {
      throw new ForbiddenException(
        `Role ${userRole} cannot perform ${requiredOperation} operation`,
      );
    }

    return true;
  }
}
