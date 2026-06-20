import 'dotenv/config';
import http from 'http';
import config from './config/env.js';
import logger from './config/logger.js';
import redis from './config/redis.js';
import prisma from './shared/prisma.js';
import app from './app.js';
import { initSocket } from './websocket/socket.js';
import { startEscalationWorker } from './queues/workers/escalation.worker.js';
import { startNotificationWorker } from './queues/workers/notification.worker.js';

async function startup() {
  try {
    await redis.ping();
    logger.info('Redis ping successful');
  } catch (err) {
    logger.error('Redis connection failed', { error: err.message });
    process.exit(1);
  }

  try {
    await prisma.$connect();
    logger.info('Prisma connected to PostgreSQL');
  } catch (err) {
    logger.error('Prisma connection failed', { error: err.message });
    process.exit(1);
  }

  const httpServer = http.createServer(app);

  initSocket(httpServer);

  startEscalationWorker();
  startNotificationWorker();

  httpServer.listen(config.PORT, () => {
    logger.info(`${config.APP_NAME} API running on port ${config.PORT} [${config.NODE_ENV}]`);
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      redis.disconnect();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startup().catch((err) => {
  logger.error('Startup failed', { error: err.message });
  process.exit(1);
});
