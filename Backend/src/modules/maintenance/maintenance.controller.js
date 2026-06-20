import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as maintenanceService from './maintenance.service.js';

// Assets
export const getAssets = catchAsync(async (req, res) => {
  const result = await maintenanceService.getAssets(req.query);
  return success(res, 'Assets retrieved', result.data, 200, result.meta);
});

export const getAssetById = catchAsync(async (req, res) => {
  const asset = await maintenanceService.getAssetById(req.params.id);
  return success(res, 'Asset retrieved', asset);
});

export const createAsset = catchAsync(async (req, res) => {
  const asset = await maintenanceService.createAsset(req.body);
  return success(res, 'Asset created', asset, 201);
});

export const updateAssetStatus = catchAsync(async (req, res) => {
  const asset = await maintenanceService.updateAssetStatus(
    req.params.id,
    req.body.status,
    req.body.note,
    req.user.id
  );
  return success(res, 'Asset status updated', asset);
});

// Tickets
export const getTickets = catchAsync(async (req, res) => {
  const result = await maintenanceService.getTickets(req.query);
  return success(res, 'Tickets retrieved', result.data, 200, result.meta);
});

export const getTicketById = catchAsync(async (req, res) => {
  const ticket = await maintenanceService.getTicketById(req.params.id);
  return success(res, 'Ticket retrieved', ticket);
});

export const createTicket = catchAsync(async (req, res) => {
  const ticket = await maintenanceService.createTicket(req.body, req.user.id);
  return success(res, 'Ticket created', ticket, 201);
});

export const updateTicket = catchAsync(async (req, res) => {
  const ticket = await maintenanceService.updateTicket(req.params.id, req.body, req.user.id);
  return success(res, 'Ticket updated', ticket);
});
