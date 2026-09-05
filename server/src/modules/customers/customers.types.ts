import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  domain: z.string().max(255).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createContactSchema = z.object({
  companyId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
});

export const updateContactSchema = createContactSchema.omit({ companyId: true }).partial();

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type CreateContactDto = z.infer<typeof createContactSchema>;
export type UpdateContactDto = z.infer<typeof updateContactSchema>;
