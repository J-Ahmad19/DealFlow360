import { db } from '../../db/client.js';
import { quotations, quotationLines } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';

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
    const q = await db.query.quotations.findFirst({
      where: eq(quotations.id, id),
    });

    if (!q) return null;

    const lines = await db.query.quotationLines.findMany({
      where: eq(quotationLines.quotationId, id),
    });

    return { ...q, lines };
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
    return db.query.quotations.findMany({
      orderBy: (q, { desc }) => [desc(q.createdAt)],
    });
  },
};
