import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import { strictRateLimit } from '../../middleware/rate-limit.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as authController from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', strictRateLimit, validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

// Admin user management
router.get('/users', authMiddleware, requireRole('ADMIN'), authController.getUsers);
router.get('/users/:id', authMiddleware, requireRole('ADMIN'), authController.getUserById);
router.patch(
  '/users/:id',
  authMiddleware,
  requireRole('ADMIN'),
  validate(
    z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().regex(/^\+234[789][01]\d{8}$/, 'Must be a valid Nigerian phone number (+234...)').optional(),
      role: z.enum(['CITIZEN', 'MAYOR', 'ADMIN']).optional(),
      isActive: z.boolean().optional(),
      zoneId: z.string().uuid().nullable().optional(),
      password: z.string().min(8).regex(/\d/, 'Must contain at least one number').optional(),
    })
  ),
  authController.updateUser
);

export default router;
