import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { PortalAuthRepository } from './portalAuth.repository.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { PortalJwtPayload } from './portalAuth.types.js';

export class PortalAuthService {
  static async requestMagicLink(email: string) {
    const contact = await PortalAuthRepository.getContactByEmail(email);

    if (!contact) {
      // Return true to prevent email enumeration, but log a warning internally
      console.warn(`[PORTAL AUTH] Request for non-existent contact email: ${email}`);
      return true;
    }

    // Generate a secure 64-byte token
    const token = crypto.randomBytes(64).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PortalAuthRepository.createToken(contact.id, tokenHash, expiresAt);

    // In a real application, send this token via email.
    // For local development, we log it so we can test.
    console.log('\n=========================================');
    console.log(`MAGIC LINK TOKEN FOR ${email}:`);
    console.log(token);
    console.log('=========================================\n');

    return true;
  }

  static async verifyToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const validToken = await PortalAuthRepository.findValidToken(tokenHash);

    if (!validToken) {
      throw new UnauthorizedError('Invalid or expired magic link');
    }

    // Mark as used
    await PortalAuthRepository.markTokenUsed(validToken.id);

    // Get contact info to embed in JWT
    const contact = await PortalAuthRepository.getContactById(validToken.contactId);

    if (!contact) {
      throw new UnauthorizedError('Contact no longer exists');
    }

    // Generate JWT
    const payload: PortalJwtPayload = {
      contactId: contact.id,
      companyId: contact.companyId,
      type: 'portal',
    };

    const jwtToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '24h',
    });

    return { jwtToken, contact };
  }

  static async getMe(contactId: string) {
    const contact = await PortalAuthRepository.getContactById(contactId);
    if (!contact) {
      throw new UnauthorizedError('Contact not found');
    }
    return contact;
  }
}
