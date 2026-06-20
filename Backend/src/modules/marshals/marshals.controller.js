import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as marshalService from './marshals.service.js';

export const getAll = catchAsync(async (req, res) => {
  const marshals = await marshalService.getAllMarshals();
  return success(res, 'Marshals retrieved', marshals);
});

export const assign = catchAsync(async (req, res) => {
  const result = await marshalService.assignMarshal(req.user.id, req.body);
  return success(res, 'Marshal assigned', result, 201);
});

export const updateLocation = catchAsync(async (req, res) => {
  await marshalService.updateLocation(req.user.id, req.body);
  return success(res, 'Location updated');
});

export const getActive = catchAsync(async (req, res) => {
  const marshals = await marshalService.getActiveMarshals();
  return success(res, 'Active marshals retrieved', marshals);
});

export const getByZone = catchAsync(async (req, res) => {
  const marshals = await marshalService.getMarshalsByZone(req.params.zoneId);
  return success(res, 'Zone marshals retrieved', marshals);
});

export const dispatchCorridor = catchAsync(async (req, res) => {
  await marshalService.dispatchCorridor(req.user.id, req.body);
  return success(res, 'Corridor instruction dispatched');
});

export const getMyAssignment = catchAsync(async (req, res) => {
  const result = await marshalService.getMyAssignment(req.user.id);
  return success(res, 'My assignment retrieved', result);
});

export const endAssignment = catchAsync(async (req, res) => {
  const updated = await marshalService.endAssignment(req.params.assignmentId);
  return success(res, 'Assignment ended', updated);
});
