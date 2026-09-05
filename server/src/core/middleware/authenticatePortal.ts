import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { PortalJwtPayload } from '../../modules/portalAuth/portalAuth.types.js';

export const authenticatePortal = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.portal_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = jwt.verify(token, config.JWT_SECRET) as PortalJwtPayload;
    
    if (payload.type !== 'portal') {
      throw new UnauthorizedError('Invalid token type');
    }

    (req as any).customer = {
      contactId: payload.contactId,
      companyId: payload.companyId,
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
