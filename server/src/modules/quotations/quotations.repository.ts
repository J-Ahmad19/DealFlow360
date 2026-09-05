import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { quotations, quotationLines, companies, users } from '../../db/schema/dealflow.js';

export const QuotationsRepository = {
  create: async (quotationData: any, linesData: any[]) => {
    return await db.transaction(async (tx) => {
      const [quotation] = await tx
        .insert(quotations)
        .values(quotationData)
        .returning();

      if (linesData.length > 0) {
        const linesToInsert = linesData.map((line) => ({
          ...line,
          quotationId: quotation.id,
        }));
        await tx.insert(quotationLines).values(linesToInsert);
      }

      return quotation;
    });
  },

  getById: async (id: string) => {
    const q = await db
      .select({
        quotation: quotations,
        customerName: companies.name,
        ownerName: users.fullName,
      })
      .from(quotations)
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .leftJoin(users, eq(quotations.ownerId, users.id))
      .where(eq(quotations.id, id))
      .limit(1);

    if (!q || q.length === 0) return null;

    const lines = await db.query.quotationLines.findMany({
      where: eq(quotationLines.quotationId, id),
    });

    return { ...q[0].quotation, customerName: q[0].customerName, ownerName: q[0].ownerName, lines };
  },

  update: async (id: string, quotationData: any, linesData?: any[]) => {
    return await db.transaction(async (tx) => {
      let updatedQuotation = null;

      if (Object.keys(quotationData).length > 0) {
        const [result] = await tx
          .update(quotations)
          .set({ ...quotationData, updatedAt: new Date() })
          .where(eq(quotations.id, id))
          .returning();
        updatedQuotation = result;
      } else {
        const [result] = await tx
          .select()
          .from(quotations)
          .where(eq(quotations.id, id));
        updatedQuotation = result;
      }

      if (linesData) {
        // Simple approach: delete all existing lines and re-insert
        await tx
          .delete(quotationLines)
          .where(eq(quotationLines.quotationId, id));

        if (linesData.length > 0) {
          const linesToInsert = linesData.map((line) => ({
            ...line,
            quotationId: id,
          }));
          await tx.insert(quotationLines).values(linesToInsert);
        }
      }

      return updatedQuotation;
    });
  },

  getAll: async () => {
    const data = await db
      .select({
        quotation: quotations,
        customerName: companies.name,
        ownerName: users.fullName,
      })
      .from(quotations)
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .leftJoin(users, eq(quotations.ownerId, users.id))
      .orderBy(desc(quotations.createdAt));

    return data.map((row) => ({
      ...row.quotation,
      customerName: row.customerName,
      ownerName: row.ownerName,
    }));
  },
};
