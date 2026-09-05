import { z } from 'zod';

export const requestLinkSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type RequestLinkInput = z.infer<typeof requestLinkSchema>;

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;

export interface PortalJwtPayload {
  contactId: string;
  companyId: string;
  type: 'portal';
}
