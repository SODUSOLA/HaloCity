import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(2).max(150),
  type: z.enum(['GATE', 'POWER_NODE', 'ROAD', 'PARKING_ZONE', 'PATHWAY', 'BUILDING']),
  zoneId: z.string().uuid(),
  code: z.string().min(2).max(30).toUpperCase(),
  description: z.string().optional(),
});

export const updateAssetStatusSchema = z.object({
  status: z.enum(['OPERATIONAL', 'DEGRADED', 'OFFLINE', 'UNDER_MAINTENANCE']),
  note: z.string().optional(),
});

export const createTicketSchema = z.object({
  assetId: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  note: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
});
