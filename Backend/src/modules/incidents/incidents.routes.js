import { Router } from 'express';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as incidentController from './incidents.controller.js';
import { createIncidentSchema, updateStatusSchema, assignIncidentSchema } from './incidents.validation.js';

const router = Router();

// Public — no auth required (anonymous + authenticated both work)
router.post('/', optionalAuthMiddleware, validate(createIncidentSchema), incidentController.create);

// Public — track incident by reference code
router.get('/track/:referenceCode', incidentController.trackByCode);

// Protected — all other routes require auth
router.get('/', authMiddleware, incidentController.getAll);
router.get('/:id', authMiddleware, incidentController.getById);
router.patch('/:id/status', authMiddleware, requireRole('MAYOR', 'ADMIN'), validate(updateStatusSchema), incidentController.updateStatus);
router.patch('/:id/assign', authMiddleware, requireRole('ADMIN'), validate(assignIncidentSchema), incidentController.assign);
router.patch('/:id/restore', authMiddleware, requireRole('ADMIN'), incidentController.restore);

export default router;
