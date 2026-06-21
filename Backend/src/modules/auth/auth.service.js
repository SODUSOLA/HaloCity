import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../shared/prisma.js';
import config from '../../config/env.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors.js';

function signToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

function stripPassword(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function register(data) {
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existingPhone) {
    throw new ConflictError('Phone number already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
    },
  });

  const token = signToken({ id: user.id, role: user.role, zoneId: user.zoneId });

  return { user: stripPassword(user), token };
}

export async function login(data) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!  isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Record login timestamp for "last active" tracking
  await prisma.user.update({ where: { id: user.id }, data: {} });

  const token = signToken({ id: user.id, role: user.role, zoneId: user.zoneId });

  return { user: stripPassword(user), token };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { zone: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return stripPassword(user);
}

// Admin: list users
export async function getUsers(query) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const { role, isActive, zoneId, search } = query;

  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (zoneId) where.zoneId = zoneId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { zone: { select: { id: true, name: true, code: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users.map(stripPassword),
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

// Admin: get single user
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { zone: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return stripPassword(user);
}

// Admin: update user
export async function updateUser(userId, data) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already taken');
  }

  if (data.phone && data.phone !== user.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw new ConflictError('Phone already taken');
  }

  if (data.zoneId) {
    const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
    if (!zone) throw new NotFoundError('Zone not found');
  }

  const updateData = { ...data };
  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
    delete updateData.password;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { zone: true },
  });

  return stripPassword(updated);
}
