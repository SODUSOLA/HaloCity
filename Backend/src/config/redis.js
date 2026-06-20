import Redis from 'ioredis';
import config from './env.js';
import logger from './logger.js';

const redis = new Redis(config.REDIS_URL);

redis.on('ready', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

export default redis;
