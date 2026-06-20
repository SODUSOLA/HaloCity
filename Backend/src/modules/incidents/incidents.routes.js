import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as incidentController from './incidents.controller.js';
import { createIncidentSchema, updateStatusSchema, assignIncidentSchema } from './incidents.validation.js';

const router = Router();

router.post('/', authMiddleware, validate(createIncidentSchema), incidentController.create);
router.get('/', authMiddleware, incidentController.getAll);
router.get('/:id', authMiddleware, incidentController.getById);
router.patch('/:id/status', authMiddleware, requireRole('MAYOR', 'ADMIN'), validate(updateStatusSchema), incidentController.updateStatus);
router.patch('/:id/assign', authMiddleware, requireRole('ADMIN'), validate(assignIncidentSchema), incidentController.assign);

export default router;
