import { z } from 'zod';

export const createZoneSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30).toUpperCase(),
  description: z.string().optional(),
  coordinates: z.object({}).passthrough().optional(),
  capacity: z.number().int().positive().optional(),
});

export const updateZoneSchema = createZoneSchema.partial();
