import { db } from '../../db/client.js';
import { users, refreshTokens } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';

export const AuthRepository = {
  findByEmail: async (email: string) => {
    return db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });
  },

  findById: async (id: string) => {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  createUser: async (email: string, fullName: string, passwordHash: string, role: string) => {
    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        fullName,
        passwordHash,
        role: role as any,
      })
      .returning();
    return user;
  },

  storeRefreshToken: async (userId: string, tokenHash: string, expiresAt: Date) => {
    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });
  },

  revokeRefreshToken: async (userId: string) => {
    // Revoke all existing refresh tokens for a user
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));
  },
};
