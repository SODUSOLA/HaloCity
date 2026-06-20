import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as zoneController from './zones.controller.js';
import { createZoneSchema, updateZoneSchema } from './zones.validation.js';

const router = Router();

router.get('/', authMiddleware, zoneController.getZones);
router.get('/:id', authMiddleware, zoneController.getZone);
router.post('/', authMiddleware, requireRole('ADMIN'), validate(createZoneSchema), zoneController.createZone);
router.patch('/:id', authMiddleware, requireRole('ADMIN'), validate(updateZoneSchema), zoneController.updateZone);
router.patch('/:id/status', authMiddleware, requireRole('ADMIN'), zoneController.setStatus);

export default router;
