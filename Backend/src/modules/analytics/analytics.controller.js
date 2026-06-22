import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as analyticsService from './analytics.service.js';

export const getHourly = catchAsync(async (req, res) => {
  const data = await analyticsService.getHourly();
  return success(res, 'Hourly incident counts', data);
});

export const getZoneHeat = catchAsync(async (req, res) => {
  const data = await analyticsService.getZoneHeat();
  return success(res, 'Zone heat data', data);
});

export const getResponseTimes = catchAsync(async (req, res) => {
  const data = await analyticsService.getResponseTimes();
  return success(res, 'Response time analytics', data);
});
