import { Request, Response, NextFunction } from 'express';
import { Permissions, hasPermission } from './permissions.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { UserContext } from '../../../modules/auth/auth.types.js';

export function authorize(permission: Permissions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as UserContext;

    if (!user || !user.role) {
      return next(new UnauthorizedError('Authentication required for authorization'));
    }

    if (!hasPermission(user.role, permission)) {
      return next(new ForbiddenError(`Insufficient permissions. Requires: ${permission}`));
    }

    next();
  };
}

export type ResourcePolicy<T = any> = (user: UserContext, resourceId?: string, resource?: T) => boolean | Promise<boolean>;

export function authorizeResource(policy: ResourcePolicy) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user as UserContext;

      if (!user || !user.role) {
        throw new UnauthorizedError('Authentication required for resource authorization');
      }

      const resourceId = req.params.id; // Convention: resource ID is in req.params.id
      
      const isAllowed = await policy(user, resourceId, req.body);
      
      if (!isAllowed) {
        throw new ForbiddenError('You do not have permission to perform this action on the requested resource');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
