import { z } from 'zod';

export const requestLinkSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type RequestLinkInput = z.infer<typeof requestLinkSchema>;

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email format'),
  companyName: z.string().trim().min(1, 'Company name is required').max(255),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;

export interface PortalJwtPayload {
  contactId: string;
  companyId: string;
  type: 'portal';
}
