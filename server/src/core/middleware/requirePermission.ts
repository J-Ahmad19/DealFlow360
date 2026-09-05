import { Permissions } from '../authz/permissions.js';
import { authorize } from '../authz/helpers.js';

export const requirePermission = (permission: Permissions) => authorize(permission);
