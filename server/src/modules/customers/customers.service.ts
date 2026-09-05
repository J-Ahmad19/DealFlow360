import { CustomersRepository } from './customers.repository.js';
import { CreateCompanyDto, UpdateCompanyDto, CreateContactDto, UpdateContactDto } from './customers.types.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/dealflow.js';

export const CustomersService = {
  createCompany: async (data: CreateCompanyDto, actorId: string) => {
    const company = await CustomersRepository.createCompany(data);
    await db.insert(auditLogs).values({
      entityType: 'company',
      entityId: company.id,
      actorId,
      action: 'create',
    });
    return company;
  },

  getCompany: async (id: string) => {
    const company = await CustomersRepository.getCompanyById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    return company;
  },

  listCompanies: async () => {
    return CustomersRepository.getAllCompanies();
  },

  updateCompany: async (id: string, data: UpdateCompanyDto, actorId: string) => {
    const company = await CustomersRepository.updateCompany(id, data);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    await db.insert(auditLogs).values({
      entityType: 'company',
      entityId: company.id,
      actorId,
      action: 'update',
    });
    return company;
  },

  addContact: async (companyId: string, data: Omit<CreateContactDto, 'companyId'>, actorId: string) => {
    const company = await CustomersRepository.getCompanyById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    const contact = await CustomersRepository.createContact({ ...data, companyId });
    await db.insert(auditLogs).values({
      entityType: 'contact',
      entityId: contact.id,
      actorId,
      action: 'create',
    });
    return contact;
  },

  listContacts: async (companyId: string) => {
    return CustomersRepository.getContactsByCompanyId(companyId);
  },

  updateContact: async (id: string, data: UpdateContactDto, actorId: string) => {
    const contact = await CustomersRepository.updateContact(id, data);
    if (!contact) {
      throw new NotFoundError('Contact not found');
    }
    await db.insert(auditLogs).values({
      entityType: 'contact',
      entityId: contact.id,
      actorId,
      action: 'update',
    });
    return contact;
  }
};
