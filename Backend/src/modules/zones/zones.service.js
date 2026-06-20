import prisma from '../../shared/prisma.js';
import redis from '../../config/redis.js';
import { NotFoundError, ConflictError } from '../../shared/errors.js';

const CACHE_KEY = 'zones:active';
const CACHE_TTL = 300;

export async function getActiveZones() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  const zones = await prisma.zone.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(zones));
  return zones;
}

export async function getZoneById(id) {
  const zone = await prisma.zone.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          incidents: { where: { status: { not: 'CLOSED' } } },
          assignments: { where: { status: 'ACTIVE' } },
        },
      },
    },
  });

  if (!zone) {
    throw new NotFoundError('Zone not found');
  }

  return zone;
}

export async function createZone(data) {
  const existing = await prisma.zone.findUnique({ where: { code: data.code } });
  if (existing) {
    throw new ConflictError('Zone code already exists');
  }

  const zone = await prisma.zone.create({ data });

  await redis.del(CACHE_KEY);

  return zone;
}

export async function updateZone(id, data) {
  const zone = await prisma.zone.findUnique({ where: { id } });
  if (!zone) {
    throw new NotFoundError('Zone not found');
  }

  if (data.code && data.code !== zone.code) {
    const existing = await prisma.zone.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new ConflictError('Zone code already exists');
    }
  }

  const updated = await prisma.zone.update({ where: { id }, data });

  await redis.del(CACHE_KEY);

  return updated;
}

export async function setZoneStatus(id, isActive) {
  const zone = await prisma.zone.findUnique({ where: { id } });
  if (!zone) {
    throw new NotFoundError('Zone not found');
  }

  const updated = await prisma.zone.update({
    where: { id },
    data: { isActive },
  });

  await redis.del(CACHE_KEY);

  return updated;
}
