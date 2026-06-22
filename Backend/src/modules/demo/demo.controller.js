import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as demoService from './demo.service.js';

export const simulate = catchAsync(async (req, res) => {
  const incident = await demoService.simulateIncident(req.user.id);
  return success(res, 'Demo incident created', incident, 201);
});

export const clear = catchAsync(async (req, res) => {
  const result = await demoService.clearNonFinal();
  return success(res, 'Non-final incidents closed', result);
});
