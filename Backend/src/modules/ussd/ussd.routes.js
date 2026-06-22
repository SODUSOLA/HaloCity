import { Router } from 'express';
import * as ussdController from './ussd.controller.js';

const router = Router();

router.post('/webhook', ussdController.webhook);

export default router;
