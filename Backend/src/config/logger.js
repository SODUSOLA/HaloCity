import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import config from './env.js';

if (!fs.existsSync(config.LOG_DIR)) {
  fs.mkdirSync(config.LOG_DIR, { recursive: true });
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
      info.app = config.APP_NAME;
      return info;
    })()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        config.NODE_ENV === 'development'
          ? winston.format.colorize()
          : winston.format.uncolorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 2 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: path.join(config.LOG_DIR, `${config.APP_NAME.toLowerCase()}-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ],
});

export default logger;
