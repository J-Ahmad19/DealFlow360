import { AppError } from '../../core/errors/AppError.js';
import { SignupInput } from './auth.schemas.js';
import { UserContext } from './auth.types.js';

export const AuthPolicy = {
  validateSignupRole: (role?: string) => {
    // 2. Public signup must NEVER allow selecting ADMIN, FINANCE, or SALES_MANAGER.
    // 3. Default public signup role = SALES_REP.
    if (!role) {
      return 'sales_rep';
    }
    
    if (['admin', 'finance', 'sales_manager'].includes(role)) {
      throw new AppError('Forbidden', 'Cannot select privileged roles during public signup', 403);
    }
    
    return 'sales_rep';
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
