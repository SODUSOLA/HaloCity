import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import config from './config/env.js';
import logger from './config/logger.js';
import errorMiddleware from './middleware/error.middleware.js';
import { defaultRateLimit } from './middleware/rate-limit.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import zoneRoutes from './modules/zones/zones.routes.js';
import incidentRoutes from './modules/incidents/incidents.routes.js';
import escalationRoutes from './modules/escalation/escalation.routes.js';
import marshalRoutes from './modules/marshals/marshals.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import demoRoutes from './modules/demo/demo.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'HaloCity API is running', timestamp: new Date().toISOString() });
});

app.use('/api', defaultRateLimit);


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/escalation', escalationRoutes);
app.use('/api/v1/marshals', marshalRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/demo', demoRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Bull Board for queue monitoring
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { escalationQueue, notificationQueue } from './queues/queue-client.js';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(escalationQueue), new BullMQAdapter(notificationQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/api/v1/health', async (req, res) => {
  const { default: prisma } = await import('./shared/prisma.js');
  const { default: redis } = await import('./config/redis.js');

  let dbStatus = 'error';
  let redisStatus = 'error';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'ok';
  } catch (e) {
    logger.error('Health check DB error', { error: e.message });
  }

  try {
    await redis.ping();
    redisStatus = 'ok';
  } catch (e) {
    logger.error('Health check Redis error', { error: e.message });
  }

  res.json({
    success: true,
    data: { db: dbStatus, redis: redisStatus, uptime: process.uptime() },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

app.use(errorMiddleware);

export default app;
