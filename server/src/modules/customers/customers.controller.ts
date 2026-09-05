import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service.js';
import { sendSuccess } from '../../core/http/response.js';
import { createCompanySchema, updateCompanySchema, createContactSchema, updateContactSchema } from './customers.types.js';

export const CustomersController = {
  createCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createCompanySchema.parse(req.body);
      const company = await CustomersService.createCompany(data, req.user!.id);
      sendSuccess(res, company, 201);
    } catch (err) {
      next(err);
    }
  },

  getCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const company = await CustomersService.getCompany(req.params.id);
      sendSuccess(res, company);
    } catch (err) {
      next(err);
    }
  },

  listCompanies: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await CustomersService.listCompanies();
      sendSuccess(res, companies);
    } catch (err) {
      next(err);
    }
  },

  updateCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateCompanySchema.parse(req.body);
      const company = await CustomersService.updateCompany(req.params.id, data, req.user!.id);
      sendSuccess(res, company);
    } catch (err) {
      next(err);
    }
  },

  addContact: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Allow omitting companyId in body if provided in params
      const payload = { ...req.body, companyId: req.params.companyId };
      const data = createContactSchema.parse(payload);
      const { companyId, ...rest } = data;
      const contact = await CustomersService.addContact(companyId, rest, req.user!.id);
      sendSuccess(res, contact, 201);
    } catch (err) {
      next(err);
    }
  },

  listContacts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contacts = await CustomersService.listContacts(req.params.companyId);
      sendSuccess(res, contacts);
    } catch (err) {
      next(err);
    }
  },

  updateContact: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateContactSchema.parse(req.body);
      const contact = await CustomersService.updateContact(req.params.contactId, data, req.user!.id);
      sendSuccess(res, contact);
    } catch (err) {
      next(err);
    }
  },
};
