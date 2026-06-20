import logger from '../config/logger.js';
import { AppError } from '../shared/errors.js';
import config from '../config/env.js';

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorMiddleware;
