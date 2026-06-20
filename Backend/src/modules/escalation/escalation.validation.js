import { z } from 'zod';

export const createRuleSchema = z.object({
  incidentType: z.enum(['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE']).nullable().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable().optional(),
  windowSeconds: z.number().int().positive(),
  escalateTo: z.enum(['MAYOR', 'ADMIN']),
  notifyVia: z.array(z.enum(['SMS', 'WEBSOCKET', 'WHATSAPP'])).optional(),
  isActive: z.boolean().optional(),
});

export const updateRuleSchema = createRuleSchema.partial();
