import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import { getNotifications, markAsRead, markAllAsRead } from './notifications.service.js';
import { parsePagination } from '../../shared/pagination.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  catchAsync(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const result = await getNotifications(req.user.id, { page, limit, channel: req.query.channel });
    return success(res, 'Notifications retrieved', result.data, 200, result.meta);
  })
);

router.patch(
  '/:id/read',
  authMiddleware,
  catchAsync(async (req, res) => {
    const notification = await markAsRead(req.params.id, req.user.id);
    return success(res, 'Notification marked as read', notification);
  })
);

router.post(
  '/read-all',
  authMiddleware,
  catchAsync(async (req, res) => {
    const result = await markAllAsRead(req.user.id);
    return success(res, 'All notifications marked as read', result);
  })
);

export default router;
