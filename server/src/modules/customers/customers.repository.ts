import { db } from '../../db/client.js';
import { companies, contacts } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { CreateCompanyDto, UpdateCompanyDto, CreateContactDto, UpdateContactDto } from './customers.types.js';

export const CustomersRepository = {
  // Companies
  createCompany: async (data: CreateCompanyDto) => {
    const [company] = await db.insert(companies).values(data).returning();
    return company;
  },

  getCompanyById: async (id: string) => {
    return db.query.companies.findFirst({
      where: eq(companies.id, id),
    });
  },

  getAllCompanies: async () => {
    return db.query.companies.findMany({
      orderBy: (companies, { desc }) => [desc(companies.createdAt)],
    });
  },

  updateCompany: async (id: string, data: UpdateCompanyDto) => {
    const [company] = await db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  },

  // Contacts
  createContact: async (data: CreateContactDto) => {
    const [contact] = await db.insert(contacts).values(data).returning();
    return contact;
  },

  getContactsByCompanyId: async (companyId: string) => {
    return db.query.contacts.findMany({
      where: eq(contacts.companyId, companyId),
    });
  },

  updateContact: async (id: string, data: UpdateContactDto) => {
    const [contact] = await db
      .update(contacts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  },
};
