import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as zoneService from './zones.service.js';

export const getZones = catchAsync(async (req, res) => {
  const zones = await zoneService.getActiveZones();
  return success(res, 'Zones retrieved', zones);
});

export const getZone = catchAsync(async (req, res) => {
  const zone = await zoneService.getZoneById(req.params.id);
  return success(res, 'Zone retrieved', zone);
});

export const createZone = catchAsync(async (req, res) => {
  const zone = await zoneService.createZone(req.body);
  return success(res, 'Zone created', zone, 201);
});

export const updateZone = catchAsync(async (req, res) => {
  const zone = await zoneService.updateZone(req.params.id, req.body);
  return success(res, 'Zone updated', zone);
});

export const setStatus = catchAsync(async (req, res) => {
  const zone = await zoneService.setZoneStatus(req.params.id, req.body.isActive);
  return success(res, 'Zone status updated', zone);
});
