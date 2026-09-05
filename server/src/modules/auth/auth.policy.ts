import { AppError } from '../../core/errors/AppError.js';
import { SignupInput } from './auth.schemas.js';
import { UserContext } from './auth.types.js';

export const AuthPolicy = {
  validateSignupRole: (role?: string) => {
    if (!role) {
      return 'sales_rep';
    }
    
    const validRoles = ['admin', 'finance', 'sales_manager', 'sales_rep'];
    if (!validRoles.includes(role)) {
      return 'sales_rep';
    }
    
    return role;
  },

  enforceUserStatus: (user: { status: string }) => {
    // 4. User status must be respected.
    if (user.status === 'suspended') {
      throw new AppError('Forbidden', 'Account is suspended', 403);
    }
    if (user.status === 'inactive') {
      throw new AppError('Forbidden', 'Account is inactive', 403);
    }
  },
};
