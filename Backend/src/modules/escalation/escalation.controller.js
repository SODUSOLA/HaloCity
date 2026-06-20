import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as escalationService from './escalation.service.js';

export const getRules = catchAsync(async (req, res) => {
  const rules = await escalationService.getRules();
  return success(res, 'Escalation rules retrieved', rules);
});

export const createRule = catchAsync(async (req, res) => {
  const rule = await escalationService.createRule(req.body, req.user.id);
  return success(res, 'Escalation rule created', rule, 201);
});

export const updateRule = catchAsync(async (req, res) => {
  const rule = await escalationService.updateRule(req.params.id, req.body);
  return success(res, 'Escalation rule updated', rule);
});

export const deleteRule = catchAsync(async (req, res) => {
  await escalationService.deleteRule(req.params.id);
  return success(res, 'Escalation rule deleted');
});
