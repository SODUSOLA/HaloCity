import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as maintenanceController from './maintenance.controller.js';
import {
  createAssetSchema,
  updateAssetStatusSchema,
  createTicketSchema,
  updateTicketSchema,
} from './maintenance.validation.js';

const router = Router();

// Asset routes
router.get('/assets', authMiddleware, requireRole('ADMIN', 'MAYOR'), maintenanceController.getAssets);
router.post('/assets', authMiddleware, requireRole('ADMIN'), validate(createAssetSchema), maintenanceController.createAsset);
router.get('/assets/:id', authMiddleware, requireRole('ADMIN', 'MAYOR'), maintenanceController.getAssetById);
router.patch('/assets/:id/status', authMiddleware, requireRole('ADMIN', 'MAYOR'), validate(updateAssetStatusSchema), maintenanceController.updateAssetStatus);

// Ticket routes
router.get('/tickets', authMiddleware, requireRole('ADMIN'), maintenanceController.getTickets);
router.post('/tickets', authMiddleware, requireRole('ADMIN'), validate(createTicketSchema), maintenanceController.createTicket);
router.get('/tickets/:id', authMiddleware, requireRole('ADMIN'), maintenanceController.getTicketById);
router.patch('/tickets/:id', authMiddleware, requireRole('ADMIN', 'MAYOR'), validate(updateTicketSchema), maintenanceController.updateTicket);

export default router;
