import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as incidentService from './incidents.service.js';

export const create = catchAsync(async (req, res) => {
  const incident = await incidentService.createIncident(req.body, req.user || null);
  return success(res, 'Incident reported successfully', incident, 201);
});

export const trackByCode = catchAsync(async (req, res) => {
  const incident = await incidentService.getIncidentByReferenceCode(req.params.referenceCode);
  return success(res, 'Incident retrieved', incident);
});

export const getAll = catchAsync(async (req, res) => {
  const result = await incidentService.getIncidents(req.user, req.query);
  return success(res, 'Incidents retrieved', result.data, 200, result.meta);
});

export const getById = catchAsync(async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.id, req.user);
  return success(res, 'Incident retrieved', incident);
});

export const updateStatus = catchAsync(async (req, res) => {
  const incident = await incidentService.updateStatus(req.params.id, req.user, req.body);
  return success(res, 'Incident status updated', incident);
});

export const assign = catchAsync(async (req, res) => {
  const incident = await incidentService.assignIncident(req.params.id, req.body.mayorId);
  return success(res, 'Incident assigned', incident);
});

export const restore = catchAsync(async (req, res) => {
  const incident = await incidentService.restoreIncident(req.params.id);
  return success(res, 'Incident restored', incident);
});
