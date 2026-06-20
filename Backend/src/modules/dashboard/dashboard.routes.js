import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/summary', authMiddleware, requireRole('ADMIN'), dashboardController.getSummary);
router.get('/incidents/live', authMiddleware, requireRole('ADMIN'), dashboardController.getLiveIncidents);
router.get('/marshals/map', authMiddleware, requireRole('ADMIN'), dashboardController.getMarshalMap);
router.get('/zones/density', authMiddleware, requireRole('ADMIN'), dashboardController.getZoneDensity);
router.get('/infrastructure', authMiddleware, requireRole('ADMIN'), dashboardController.getInfrastructureStatus);
router.get('/escalations', authMiddleware, requireRole('ADMIN'), dashboardController.getPendingEscalations);

export default router;
