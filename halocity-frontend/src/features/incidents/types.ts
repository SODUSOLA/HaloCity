import { z } from 'zod'

export const createIncidentSchema = z.object({
  type: z.enum(['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE'], {
    required_error: 'Select an incident type',
  }),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title is too long'),
  description: z.string().optional(),
  zoneId: z.string().uuid('Select a zone'),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  mediaUrls: z.array(z.string()).max(5).default([]),
})

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>
