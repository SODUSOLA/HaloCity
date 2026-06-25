import { z } from 'zod';

export const createIncidentSchema = z.object({
  type: z.enum(['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE']),
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  zoneId: z.string().uuid(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  reporterPhone: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional().default([]),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  note: z.string().optional(),
  resolutionNote: z.string().max(1000).optional(),
});

export const assignIncidentSchema = z.object({
  mayorId: z.string().uuid(),
});
