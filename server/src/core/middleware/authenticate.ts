import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AuthRepository } from '../../modules/auth/auth.repository.js';
import { AppError } from '../errors/AppError.js';
import { JwtPayload } from '../../modules/auth/auth.types.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError('Unauthorized', 'Authentication required', 401);
    }

    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const user = await AuthRepository.findById(payload.userId);
    
    if (!user) {
      throw new AppError('Unauthorized', 'Invalid user', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Forbidden', 'Account is suspended', 403);
    }
    
    if (user.status === 'inactive') {
      throw new AppError('Forbidden', 'Account is inactive', 403);
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
      next(new AppError('Unauthorized', 'Invalid or expired token', 401));
    } else {
      next(error);
    }
  }
};
