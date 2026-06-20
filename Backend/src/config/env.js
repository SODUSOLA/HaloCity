import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  APP_NAME: z.string().default('HaloCity'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('24h'),
  TERMII_API_KEY: z.string().optional().default(''),
  TERMII_SENDER_ID: z.string().optional().default('HaloCity'),
  TERMII_BASE_URL: z.string().optional().default('https://api.ng.termii.com'),
  CLIENT_URL: z.string().optional().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
  LOG_DIR: z.string().default('logs'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const missing = result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
  console.error(`Environment validation failed:\n${missing}`);
  process.exit(1);
}

const config = result.data;

export default config;
