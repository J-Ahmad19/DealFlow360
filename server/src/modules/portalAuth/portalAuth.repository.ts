import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { portalTokens, contacts, companies, auditLogs } from '../../db/schema/dealflow.js';

export class PortalAuthRepository {
  static async getContactByEmail(email: string) {
    const [contact] = await db
      .select({
        id: contacts.id,
        email: contacts.email,
        companyId: contacts.companyId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
      })
      .from(contacts)
      .where(eq(contacts.email, email))
      .limit(1);

    return contact || null;
  }

  static async getContactById(contactId: string) {
    const [contact] = await db
      .select({
        id: contacts.id,
        email: contacts.email,
        companyId: contacts.companyId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
      })
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    if (!contact) return null;

    const [company] = await db
      .select({
        id: companies.id,
        name: companies.name,
        domain: companies.domain,
      })
      .from(companies)
      .where(eq(companies.id, contact.companyId))
      .limit(1);

    return { ...contact, company };
  }

  static async createToken(contactId: string, tokenHash: string, expiresAt: Date) {
    const [token] = await db
      .insert(portalTokens)
      .values({
        contactId,
        tokenHash,
        expiresAt,
      })
      .returning();

    return token;
  }

  static async findValidToken(tokenHash: string) {
    const [token] = await db
      .select()
      .from(portalTokens)
      .where(
        and(
          eq(portalTokens.tokenHash, tokenHash),
          isNull(portalTokens.usedAt),
          gt(portalTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    return token || null;
  }

  static async markTokenUsed(tokenId: string) {
    await db
      .update(portalTokens)
      .set({ usedAt: new Date() })
      .where(eq(portalTokens.id, tokenId));
  }
}
