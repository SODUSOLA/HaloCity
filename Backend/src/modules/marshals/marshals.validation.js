import { z } from 'zod';

export const assignMarshalSchema = z.object({
  mayorId: z.string().uuid(),
  zoneId: z.string().uuid(),
  instructions: z.string().optional(),
  startTime: z.string().datetime().optional(),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
});

export const corridorSchema = z.object({
  zoneIds: z.array(z.string().uuid()).min(1),
  message: z.string().min(5).max(500),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
  incidentId: z.string().uuid().optional(),
});
