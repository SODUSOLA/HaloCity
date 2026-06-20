import catchAsync from '../../shared/catch-async.js';
import { success } from '../../shared/response.js';
import * as authService from './auth.service.js';

export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  return success(res, 'Registration successful', result, 201);
});

export const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, 'Login successful', result);
});

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return success(res, 'User profile retrieved', user);
});

export const getUsers = catchAsync(async (req, res) => {
  const result = await authService.getUsers(req.query);
  return success(res, 'Users retrieved', result.data, 200, result.meta);
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.params.id);
  return success(res, 'User retrieved', user);
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await authService.updateUser(req.params.id, req.body);
  return success(res, 'User updated', user);
});
