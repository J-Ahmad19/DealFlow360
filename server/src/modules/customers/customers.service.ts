import { CustomersRepository } from './customers.repository.js';
import { CreateCompanyDto, UpdateCompanyDto, CreateContactDto, UpdateContactDto } from './customers.types.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export const CustomersService = {
  createCompany: async (data: CreateCompanyDto, actorId: string) => {
    const company = await CustomersRepository.createCompany(data);
    await AuditService.log({
      actorId,
      entityType: 'company',
      entityId: company.id,
      action: AuditAction.CUSTOMER_CREATED,
      after: company,
    });
    return company;
  },

  getCompany: async (id: string) => {
    const company = await CustomersRepository.getCompanyById(id);
    if (!company) throw new NotFoundError('Company not found');
    return company;
  },

  listCompanies: async () => CustomersRepository.getAllCompanies(),

  updateCompany: async (id: string, data: UpdateCompanyDto, actorId: string) => {
    const existing = await CustomersRepository.getCompanyById(id);
    const company = await CustomersRepository.updateCompany(id, data);
    if (!company) throw new NotFoundError('Company not found');
    await AuditService.log({
      actorId,
      entityType: 'company',
      entityId: company.id,
      action: AuditAction.CUSTOMER_UPDATED,
      before: existing,
      after: company,
    });
    return company;
  },

  addContact: async (companyId: string, data: Omit<CreateContactDto, 'companyId'>, actorId: string) => {
    const company = await CustomersRepository.getCompanyById(companyId);
    if (!company) throw new NotFoundError('Company not found');
    const contact = await CustomersRepository.createContact({ ...data, companyId });
    await AuditService.log({
      actorId,
      entityType: 'contact',
      entityId: contact.id,
      action: AuditAction.CUSTOMER_CREATED,
      after: contact,
    });
    return contact;
  },

  listContacts: async (companyId: string) => CustomersRepository.getContactsByCompanyId(companyId),

  updateContact: async (id: string, data: UpdateContactDto, actorId: string) => {
    const existing = await CustomersRepository.getContactById?.(id).catch(() => null);
    const contact = await CustomersRepository.updateContact(id, data);
    if (!contact) throw new NotFoundError('Contact not found');
    await AuditService.log({
      actorId,
      entityType: 'contact',
      entityId: contact.id,
      action: AuditAction.CUSTOMER_UPDATED,
      before: existing ?? null,
      after: contact,
    });
    return contact;
  },
};
