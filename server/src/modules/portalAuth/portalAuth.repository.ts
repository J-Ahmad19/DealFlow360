import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { portalTokens, contacts, companies, users } from '../../db/schema/dealflow.js';

export class PortalAuthRepository {
  static async getContactByEmail(email: string) {
    const result = await db
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

    return Array.isArray(result) ? result[0] ?? null : null;
  }

  static async getCompanyByName(name: string) {
    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.name, name))
      .limit(1);

    return Array.isArray(result) ? result[0] ?? null : null;
  }

  static async createCompany(name: string) {
    const result = await db
      .insert(companies)
      .values({ name })
      .returning();

    return Array.isArray(result) ? result[0] ?? null : null;
  }

  static async createContact(data: {
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
  }) {
    const [contact] = await db
      .insert(contacts)
      .values({
        companyId: data.companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      })
      .returning();

    if (contact) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1);

      if (!existingUser.length) {
        await db.insert(users).values({
          email: data.email.toLowerCase(),
          fullName: `${data.firstName} ${data.lastName}`.trim(),
          passwordHash: null,
          role: 'customer',
          status: 'active',
        });
      }
    }

    return contact ?? null;
  }

  static async getContactById(contactId: string) {
    const result = await db
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

    const contact = Array.isArray(result) ? result[0] ?? null : null;
    if (!contact) return null;

    const companyResult = await db
      .select({
        id: companies.id,
        name: companies.name,
        domain: companies.domain,
      })
      .from(companies)
      .where(eq(companies.id, contact.companyId))
      .limit(1);

    const company = Array.isArray(companyResult) ? companyResult[0] ?? null : null;
    return { ...contact, company };
  }

  static async createToken(contactId: string, tokenHash: string, expiresAt: Date) {
    const result = await db
      .insert(portalTokens)
      .values({
        contactId,
        tokenHash,
        expiresAt,
      })
      .returning();

    return Array.isArray(result) ? result[0] ?? null : null;
  }

  static async findValidToken(tokenHash: string) {
    const result = await db
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

    return Array.isArray(result) ? result[0] ?? null : null;
  }

  static async markTokenUsed(tokenId: string) {
    await db
      .update(portalTokens)
      .set({ usedAt: new Date() })
      .where(eq(portalTokens.id, tokenId));
  }
}
