import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+234[789][01]\d{8}$/, 'Must be a valid Nigerian phone number (+234...)'),
  password: z.string().min(8).regex(/\d/, 'Must contain at least one number'),
  role: z.enum(['CITIZEN', 'MAYOR']).optional().default('CITIZEN'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
