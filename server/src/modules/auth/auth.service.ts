import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/index.js';
import { AuthRepository } from './auth.repository.js';
import { AuthPolicy } from './auth.policy.js';
import { AppError } from '../../core/errors/AppError.js';
import { SignupInput, LoginInput } from './auth.schemas.js';

export const AuthService = {
  signup: async (input: SignupInput) => {
    // 1. Signup creates an internal user.
    const existing = await AuthRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Conflict', 'Email already in use', 409);
    }

    const role = AuthPolicy.validateSignupRole(input.role);
    
    // Hash password with Argon2id
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

    const user = await AuthRepository.createUser(input.email, input.fullName, passwordHash, role);

    // 13. Add audit events for sensitive authentication events where appropriate.
    // (Assuming we had a generalized audit logger, we would call it here)
    // AuditLogger.log({ action: 'USER_SIGNUP', actorId: user.id });

    return AuthService.generateTokens(user.id);
  },

  login: async (input: LoginInput) => {
    const user = await AuthRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new AppError('Unauthorized', 'Invalid credentials', 401);
    }

    AuthPolicy.enforceUserStatus(user);

    // 5. Login verifies password hash.
    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      throw new AppError('Unauthorized', 'Invalid credentials', 401);
    }

    return AuthService.generateTokens(user.id);
  },

  refresh: async (userId: string) => {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw new AppError('Unauthorized', 'Invalid user', 401);
    }

    AuthPolicy.enforceUserStatus(user);
    
    // Revoke old tokens
    await AuthRepository.revokeRefreshToken(userId);

    return AuthService.generateTokens(user.id);
  },

  logout: async (userId: string) => {
    await AuthRepository.revokeRefreshToken(userId);
  },

  generateTokens: async (userId: string) => {
    // 6. Access tokens should be short-lived.
    const accessToken = jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '15m' });
    
    // Generate secure random refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // 7. Refresh tokens must be persisted hashed in PostgreSQL.
    const tokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await AuthRepository.storeRefreshToken(userId, tokenHash, expiresAt);

    return { accessToken, refreshToken };
  },
};
