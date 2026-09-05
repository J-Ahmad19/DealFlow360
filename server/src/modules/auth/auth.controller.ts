import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { signupSchema, loginSchema } from './auth.schemas.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export const AuthController = {
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = signupSchema.parse(req).body;
      const tokens = await AuthService.signup(input);
      AuthController.setCookies(res, tokens);
      // Decode userId from fresh token to fetch user for response
      const user = await AuthRepository.findByEmail(input.email);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: user
          ? { id: user.id, email: user.email, fullName: user.fullName, role: user.role, status: user.status }
          : null,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req).body;
      const context = AuditService.fromRequest(req);
      const tokens = await AuthService.login(input, context);
      AuthController.setCookies(res, tokens);
      // Fetch user to return role/fullName to frontend
      const user = await AuthRepository.findByEmail(input.email);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user: user
          ? { id: user.id, email: user.email, fullName: user.fullName, role: user.role, status: user.status }
          : null,
      });
    } catch (error) {
      next(error);
    }
  },


  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (user) {
        await AuthService.logout(user.id);
      }
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const tokens = await AuthService.refresh(user.id);
      AuthController.setCookies(res, tokens);
      res.status(200).json({ success: true, message: 'Tokens refreshed successfully' });
    } catch (error) {
      next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // Return under 'user' key — consistent with login/signup responses
      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  },

  setCookies: (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  },
};
