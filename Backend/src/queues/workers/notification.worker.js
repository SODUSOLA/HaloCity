import { Worker } from 'bullmq';
import axios from 'axios';
import { Redis } from 'ioredis';
import config from '../../config/env.js';
import logger from '../../config/logger.js';
import prisma from '../../shared/prisma.js';
import { getIO } from '../../websocket/socket.js';

const url = new URL(config.REDIS_URL);
const connection = {
  host: url.hostname || 'localhost',
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
};

async function sendViaSMS(phone, message, channel) {
  const payload = {
    to: phone,
    from: config.TERMII_SENDER_ID,
    sms: message,
    type: 'plain',
    channel: channel === 'WHATSAPP' ? 'whatsapp' : 'generic',
    api_key: config.TERMII_API_KEY,
  };

  const response = await axios.post(
    `${config.TERMII_BASE_URL}/api/sms/send`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data;
}

async function processNotification(job) {
  const { notificationId } = job.data;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: { user: true },
  });

  if (!notification) {
    logger.warn('Notification job: record not found', { notificationId });
    return;
  }

  if (notification.status === 'SENT') {
    logger.info('Notification already sent', { notificationId });
    return;
  }

  const { channel, user } = notification;

  try {
    if (channel === 'SMS' || channel === 'WHATSAPP') {
      await sendViaSMS(user.phone, notification.body, channel);
    } else if (channel === 'WEBSOCKET') {
      try {
        const io = getIO();
        const room = user.role === 'ADMIN' ? 'admin' : user.role === 'MAYOR' ? `mayor:${user.id}` : `citizen:${user.id}`;
        io.to(room).emit('notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          referenceId: notification.referenceId,
          referenceType: notification.referenceType,
          createdAt: notification.createdAt,
        });
      } catch (wsErr) {
        logger.warn('WebSocket notification failed (socket not initialized)', {
          error: wsErr.message,
        });
      }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT', sentAt: new Date() },
    });

    logger.info('Notification sent', { notificationId, channel });
  } catch (err) {
    logger.error('Notification send failed', {
      notificationId,
      channel,
      error: err.message,
    });
    throw err;
  }
}

export function startNotificationWorker() {
  const worker = new Worker('notifications', processNotification, {
    connection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info('Notification job completed', { jobId: job.id });
  });

  worker.on('failed', async (job, err) => {
    logger.error('Notification job failed', { jobId: job?.id, error: err.message });
    if (job && job.attemptsMade >= (job.opts?.attempts || 3)) {
      try {
        await prisma.notification.update({
          where: { id: job.data.notificationId },
          data: { status: 'FAILED' },
        });
      } catch (dbErr) {
        logger.error('Failed to mark notification as FAILED', {
          error: dbErr.message,
          notificationId: job.data.notificationId,
        });
      }
    }
  });

  logger.info('Notification worker started');
  return worker;
}
