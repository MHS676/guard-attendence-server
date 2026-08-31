import { SetMetadata } from '@nestjs/common';
import { CrudOperation } from './crud.guard';

/**
 * Decorator to specify which CRUD operation a controller method requires
 * Usage: @Crud(CrudOperation.CREATE)
 */
export const Crud = (operation: CrudOperation) =>
  SetMetadata('crudOperation', operation);
