import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/index.js';
import { AuthRepository } from './auth.repository.js';
import { AuthPolicy } from './auth.policy.js';
import { AppError } from '../../core/errors/AppError.js';
import { SignupInput, LoginInput } from './auth.schemas.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export const AuthService = {
  signup: async (input: SignupInput) => {
    const existing = await AuthRepository.findByEmail(input.email);
    if (existing) throw new AppError('Conflict', 'Email already in use', 409);

    const role = AuthPolicy.validateSignupRole(input.role);
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await AuthRepository.createUser(input.email, input.fullName, passwordHash, role);

    await AuditService.log({
      actorId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: AuditAction.USER_SIGNUP,
      after: { email: user.email, role: user.role },
    });

    return AuthService.generateTokens(user.id);
  },

  login: async (input: LoginInput, context?: { ipAddress?: string; userAgent?: string }) => {
    const user = await AuthRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) throw new AppError('Unauthorized', 'Invalid credentials', 401);

    AuthPolicy.enforceUserStatus(user);

    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) throw new AppError('Unauthorized', 'Invalid credentials', 401);

    await AuditService.log({
      actorId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: AuditAction.USER_LOGIN,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return AuthService.generateTokens(user.id);
  },

  refresh: async (userId: string) => {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new AppError('Unauthorized', 'Invalid user', 401);
    AuthPolicy.enforceUserStatus(user);
    await AuthRepository.revokeRefreshToken(userId);
    return AuthService.generateTokens(user.id);
  },

  logout: async (userId: string) => {
    await AuthRepository.revokeRefreshToken(userId);
    await AuditService.log({
      actorId: userId,
      entityType: 'user',
      entityId: userId,
      action: AuditAction.USER_LOGOUT,
    });
  },

  generateTokens: async (userId: string) => {
    const accessToken = jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await AuthRepository.storeRefreshToken(userId, tokenHash, expiresAt);
    return { accessToken, refreshToken };
  },
};
