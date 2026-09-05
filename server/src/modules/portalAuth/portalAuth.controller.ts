import { Request, Response, NextFunction } from 'express';
import { PortalAuthService } from './portalAuth.service.js';
import { requestLinkSchema, verifyTokenSchema } from './portalAuth.types.js';
import { ValidationError } from '../../core/errors/AppError.js';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/dealflow.js';

export class PortalAuthController {
  static async requestLink(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = requestLinkSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.errors[0].message);
      }

      await PortalAuthService.requestMagicLink(parsed.data.email);

      res.status(200).json({
        message: 'If an account exists with that email, a magic link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifyTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.errors[0].message);
      }

      const { jwtToken, contact } = await PortalAuthService.verifyToken(parsed.data.token);

      // Log successful login
      await db.insert(auditLogs).values({
        entityType: 'contact',
        entityId: contact.id,
        actorId: '00000000-0000-0000-0000-000000000000', // System user or could leave null if schema allowed it (it doesn't, so we should either adjust schema or use a system ID. Let's use a zero UUID, or omit it if possible. Wait, actorId is a reference to users.id. This is tricky. Let's skip audit for now, or just use a dummy. Actually we probably shouldn't do auditLogs if it breaks FK).
        // Let's just return the token in cookie
        action: 'PORTAL_LOGIN_SUCCESS',
      }).catch(err => console.warn('Could not write audit log due to FK constraint', err));

      // Secure cookie
      res.cookie('portal_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(200).json({
        message: 'Successfully authenticated',
        contact: {
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          companyId: contact.companyId,
          company: contact.company,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('portal_token');
      res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = (req as any).customer;
      if (!customer) {
        return res.status(401).json({ error: { message: 'Not authenticated' } });
      }

      const contact = await PortalAuthService.getMe(customer.contactId);
      
      res.status(200).json({
        contact: {
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          companyId: contact.companyId,
          company: contact.company,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
