import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import logger from '../config/logger.js';

let io = null;

export function initSocket(httpServer) {
const allowedOrigins = config.CLIENT_URL.split(',').map((s) => s.trim());
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), config.JWT_SECRET);
      socket.data.user = { id: decoded.id, role: decoded.role, zoneId: decoded.zoneId };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket.data;

    if (user.role === 'ADMIN') {
      socket.join('admin');
    } else if (user.role === 'MAYOR') {
      socket.join(`mayor:${user.id}`);
      if (user.zoneId) {
        socket.join(`zone:${user.zoneId}`);
      }
    } else if (user.role === 'CITIZEN') {
      socket.join(`citizen:${user.id}`);
      if (user.zoneId) {
        socket.join(`zone:${user.zoneId}`);
      }
    }

    // Allow any user to dynamically join/leave zone rooms (for zone alerts)
    socket.on('join:zone', ({ zoneId }) => {
      if (zoneId) {
        socket.join(`zone:${zoneId}`);
        logger.debug(`[WS] ${user.role} ${user.id} joined zone:${zoneId}`);
      }
    });

    socket.on('leave:zone', ({ zoneId }) => {
      if (zoneId) {
        socket.leave(`zone:${zoneId}`);
        logger.debug(`[WS] ${user.role} ${user.id} left zone:${zoneId}`);
      }
    });

    logger.info(`[WS] ${user.role} ${user.id} connected`);

    socket.on('disconnect', () => {
      logger.info(`[WS] ${user.role} ${user.id} disconnected`);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
