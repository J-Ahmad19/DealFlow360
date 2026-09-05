import { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { companies } from '../../db/schema/dealflow.js';
import { asc } from 'drizzle-orm';

export const CompaniesController = {
  list: async (req: Request, res: Response) => {
    try {
      const data = await db.select().from(companies).orderBy(asc(companies.name));
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};