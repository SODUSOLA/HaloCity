import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as marshalController from './marshals.controller.js';
import { assignMarshalSchema, updateLocationSchema, corridorSchema } from './marshals.validation.js';

const router = Router();

router.get('/', authMiddleware, requireRole('ADMIN'), marshalController.getAll);
router.post('/assign', authMiddleware, requireRole('ADMIN'), validate(assignMarshalSchema), marshalController.assign);
router.patch('/location', authMiddleware, requireRole('MAYOR'), validate(updateLocationSchema), marshalController.updateLocation);
router.get('/active', authMiddleware, requireRole('ADMIN'), marshalController.getActive);
router.get('/zone/:zoneId', authMiddleware, requireRole('ADMIN', 'MAYOR'), marshalController.getByZone);
router.post('/corridor', authMiddleware, requireRole('ADMIN'), validate(corridorSchema), marshalController.dispatchCorridor);
router.get('/me', authMiddleware, requireRole('MAYOR'), marshalController.getMyAssignment);
router.patch('/:assignmentId/end', authMiddleware, requireRole('ADMIN'), marshalController.endAssignment);

export default router;
