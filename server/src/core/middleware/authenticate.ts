import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AuthRepository } from '../../modules/auth/auth.repository.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { JwtPayload } from '../../modules/auth/auth.types.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const user = await AuthRepository.findById(payload.userId);
    
    if (!user) {
      throw new UnauthorizedError('Invalid user');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError('Account is suspended');
    }
    
    if (user.status === 'inactive') {
      throw new ForbiddenError('Account is inactive');
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};
