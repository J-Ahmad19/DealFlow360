import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { PortalAuthRepository } from './portalAuth.repository.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { PortalJwtPayload, SignupInput } from './portalAuth.types.js';

export class PortalAuthService {
  static buildMagicLink(token: string) {
    const frontendBaseUrl = process.env.PORTAL_FRONTEND_URL || 'http://localhost:5173';
    return `${frontendBaseUrl}/portal/verify?token=${encodeURIComponent(token)}`;
  }

  static async requestMagicLink(email: string) {
    const contact = await PortalAuthRepository.getContactByEmail(email);

    if (!contact) {
      console.warn(`[PORTAL AUTH] Request for non-existent contact email: ${email}`);
      throw new UnauthorizedError('This customer account is not registered yet. Please sign up first.');
    }

    const token = crypto.randomBytes(64).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PortalAuthRepository.createToken(contact.id, tokenHash, expiresAt);

    const loginUrl = this.buildMagicLink(token);

    console.log('\n=========================================');
    console.log(`PORTAL LOGIN LINK FOR ${email}:`);
    console.log(loginUrl);
    console.log('=========================================\n');

    return { loginUrl };
  }

  static async signup(input: SignupInput) {
    const existingContact = await PortalAuthRepository.getContactByEmail(input.email);
    if (existingContact) {
      throw new UnauthorizedError('An account already exists for this email. Please log in instead.');
    }

    let company = await PortalAuthRepository.getCompanyByName(input.companyName);
    if (!company) {
      company = await PortalAuthRepository.createCompany(input.companyName);
    }

    const contact = await PortalAuthRepository.createContact({
      companyId: company.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
    });

    const { loginUrl } = await this.requestMagicLink(input.email);

    return {
      contactId: contact.id,
      companyId: company.id,
      email: input.email,
      loginUrl,
    };
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
