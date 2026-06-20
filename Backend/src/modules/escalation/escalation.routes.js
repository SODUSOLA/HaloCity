import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as escalationController from './escalation.controller.js';
import { createRuleSchema, updateRuleSchema } from './escalation.validation.js';

const router = Router();

router.get('/rules', authMiddleware, requireRole('ADMIN'), escalationController.getRules);
router.post('/rules', authMiddleware, requireRole('ADMIN'), validate(createRuleSchema), escalationController.createRule);
router.patch('/rules/:id', authMiddleware, requireRole('ADMIN'), validate(updateRuleSchema), escalationController.updateRule);
router.delete('/rules/:id', authMiddleware, requireRole('ADMIN'), escalationController.deleteRule);

export default router;
