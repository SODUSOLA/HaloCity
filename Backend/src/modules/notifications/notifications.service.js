import prisma from '../../shared/prisma.js';
import logger from '../../config/logger.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors.js';
import { notificationQueue } from '../../queues/queue-client.js';

export async function dispatch({ userId, type, channel, title, body, referenceId, referenceType }) {
  let notification;
  try {
    notification = await prisma.notification.create({
      data: {
        userId,
        type,
        channel,
        title: title || '',
        body: body || '',
        referenceId,
        referenceType,
        status: 'PENDING',
      },
    });
  } catch (err) {
    logger.error('Failed to create notification record', {
      error: err.message,
      userId,
      type,
      channel,
    });
    return;
  }

  try {
    await notificationQueue.add(
      `notification:${notification.id}`,
      { notificationId: notification.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      }
    );
    logger.info('Notification queued', { notificationId: notification.id, channel });
  } catch (err) {
    logger.error('Failed to queue notification job', {
      error: err.message,
      notificationId: notification.id,
    });
  }
}

export async function getNotifications(userId, { page = 1, limit = 20, channel }) {
  const skip = (page - 1) * limit;
  const where = { userId };
  if (channel) where.channel = channel;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, status: 'PENDING' } }),
  ]);

  return {
    data: notifications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    },
  };
}

export async function markAsRead(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { status: 'DELIVERED' },
  });
}

export async function markAllAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { userId, status: 'PENDING' },
    data: { status: 'DELIVERED' },
  });

  return { count: result.count };
}
