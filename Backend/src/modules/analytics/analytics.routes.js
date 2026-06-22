import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import * as analyticsController from './analytics.controller.js';

const router = Router();

router.get('/hourly', authMiddleware, requireRole('ADMIN'), analyticsController.getHourly);
router.get('/zone-heat', authMiddleware, requireRole('ADMIN'), analyticsController.getZoneHeat);
router.get('/response-times', authMiddleware, requireRole('ADMIN'), analyticsController.getResponseTimes);

export default router;
