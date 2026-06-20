import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as dashboardService from './dashboard.service.js';

export const getSummary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary();
  return success(res, 'Dashboard summary retrieved', data);
});

export const getLiveIncidents = catchAsync(async (req, res) => {
  const result = await dashboardService.getLiveIncidents(req.query);
  return success(res, 'Live incidents retrieved', result.data, 200, result.meta);
});

export const getMarshalMap = catchAsync(async (req, res) => {
  const data = await dashboardService.getMarshalMap();
  return success(res, 'Marshal map data retrieved', data);
});

export const getZoneDensity = catchAsync(async (req, res) => {
  const data = await dashboardService.getZoneDensity();
  return success(res, 'Zone density retrieved', data);
});

export const getInfrastructureStatus = catchAsync(async (req, res) => {
  const data = await dashboardService.getInfrastructureStatus();
  return success(res, 'Infrastructure status retrieved', data);
});

export const getPendingEscalations = catchAsync(async (req, res) => {
  const data = await dashboardService.getPendingEscalations();
  return success(res, 'Pending escalations retrieved', data);
});
