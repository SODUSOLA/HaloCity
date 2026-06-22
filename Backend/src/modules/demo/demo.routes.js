import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import * as demoController from './demo.controller.js';

const router = Router();

router.post('/simulate-incident', authMiddleware, requireRole('ADMIN'), demoController.simulate);
router.post('/clear', authMiddleware, requireRole('ADMIN'), demoController.clear);

export default router;
