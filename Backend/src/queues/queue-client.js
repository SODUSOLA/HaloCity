import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../config/env.js';

const url = new URL(config.REDIS_URL);
const connection = {
  host: url.hostname || 'localhost',
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
};

export const escalationQueue = new Queue('escalation', { connection });
export const notificationQueue = new Queue('notifications', { connection });
