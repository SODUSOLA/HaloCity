import prisma from '../../shared/prisma.js';
import redis from '../../config/redis.js';
import logger from '../../config/logger.js';
import { NotFoundError, ConflictError } from '../../shared/errors.js';
import { parsePagination } from '../../shared/pagination.js';

async function generateTicketNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;

  const key = `tickets:seq:${dateStr}`;
  const seq = await redis.incr(key);
  await redis.expire(key, 86400);

  return `TKT-${dateStr}-${String(seq).padStart(3, '0')}`;
}

const SEVERITY_TO_PRIORITY = {
  CRITICAL: 'URGENT',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

// Assets
export async function getAssets(query) {
  const { page, limit, skip } = parsePagination(query);
  const { zoneId, type, status } = query;

  const where = {};
  if (zoneId) where.zoneId = zoneId;
  if (type) where.type = type;
  if (status) where.status = status;

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        zone: { select: { id: true, name: true } },
        _count: { select: { tickets: { where: { status: { notIn: ['CLOSED', 'RESOLVED'] } } } } },
      },
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    data: assets,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAssetById(id) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      zone: { select: { id: true, name: true, code: true } },
      _count: { select: { tickets: { where: { status: { notIn: ['CLOSED', 'RESOLVED'] } } } } },
    },
  });

  if (!asset) {
    throw new NotFoundError('Asset not found');
  }

  return asset;
}

export async function createAsset(data) {
  const existing = await prisma.asset.findUnique({ where: { code: data.code } });
  if (existing) {
    throw new ConflictError('Asset code already exists');
  }

  return prisma.asset.create({ data });
}

export async function updateAssetStatus(id, status, note, updatedById) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new NotFoundError('Asset not found');
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: { status },
  });

  if (status === 'OFFLINE') {
    const ticketNumber = await generateTicketNumber();
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    await prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        assetId: id,
        title: `Auto: ${asset.name} is OFFLINE`,
        description: note || `Asset ${asset.name} (${asset.code}) marked as OFFLINE`,
        priority: 'URGENT',
        reportedById: updatedById || adminUser?.id || 'unknown',
        status: 'OPEN',
      },
    });

    logger.info('Auto-created maintenance ticket for OFFLINE asset', {
      assetId: id,
      assetName: asset.name,
    });
  }

  return updated;
}

// Tickets
export async function getTickets(query) {
  const { page, limit, skip } = parsePagination(query);
  const { status, priority, assetId, zoneId } = query;

  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assetId) where.assetId = assetId;
  if (zoneId) {
    where.asset = { zoneId };
  }

  const [tickets, total] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
      include: {
        asset: { select: { id: true, name: true, code: true, type: true } },
        incident: { select: { id: true, referenceCode: true } },
        assignedTo: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.maintenanceTicket.count({ where }),
  ]);

  return {
    data: tickets,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTicketById(id) {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id },
    include: {
      asset: true,
      incident: { select: { id: true, referenceCode: true } },
      assignedTo: { select: { id: true, name: true } },
      reportedBy: { select: { id: true, name: true } },
      logs: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Maintenance ticket not found');
  }

  return ticket;
}

export async function createTicket(data, reportedById) {
  const ticketNumber = await generateTicketNumber();

  return prisma.maintenanceTicket.create({
    data: {
      ticketNumber,
      assetId: data.assetId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      reportedById,
      assignedToId: data.assignedToId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: 'OPEN',
    },
    include: {
      asset: { select: { id: true, name: true, code: true } },
      reportedBy: { select: { id: true, name: true } },
    },
  });
}

export async function updateTicket(id, data, updatedById) {
  const ticket = await prisma.maintenanceTicket.findUnique({ where: { id } });
  if (!ticket) {
    throw new NotFoundError('Maintenance ticket not found');
  }

  await prisma.maintenanceLog.create({
    data: {
      ticketId: id,
      updatedById,
      oldStatus: ticket.status,
      newStatus: data.status,
      note: data.note || null,
    },
  });

  const updateData = { status: data.status };
  if (data.assignedToId) updateData.assignedToId = data.assignedToId;
  if (data.status === 'RESOLVED') updateData.resolvedAt = new Date();

  const updated = await prisma.maintenanceTicket.update({
    where: { id },
    data: updateData,
    include: {
      asset: { select: { id: true, name: true, code: true } },
      assignedTo: { select: { id: true, name: true } },
      reportedBy: { select: { id: true, name: true } },
    },
  });

  if (data.status === 'RESOLVED') {
    await prisma.asset.update({
      where: { id: ticket.assetId },
      data: { status: 'OPERATIONAL' },
    });
    logger.info('Asset restored to OPERATIONAL after ticket resolution', {
      assetId: ticket.assetId,
      ticketId: id,
    });
  }

  return updated;
}

export async function createFromIncident(incident) {
  try {
    const assets = await prisma.asset.findMany({
      where: { zoneId: incident.zoneId },
      take: 1,
    });

    if (assets.length === 0) {
      logger.warn('No assets found in zone for auto-ticket', {
        zoneId: incident.zoneId,
        incidentId: incident.id,
      });
      return null;
    }

    const priority = SEVERITY_TO_PRIORITY[incident.severity] || 'MEDIUM';
    const ticketNumber = await generateTicketNumber();

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        assetId: assets[0].id,
        incidentId: incident.id,
        title: `Auto: ${incident.title}`,
        description: incident.description || '',
        priority,
        reportedById: incident.reporterId,
        status: 'OPEN',
      },
    });

    logger.info('Auto-created maintenance ticket from infrastructure incident', {
      incidentId: incident.id,
      ticketId: ticket.id,
      ticketNumber,
    });

    return ticket;
  } catch (err) {
    logger.error('Failed to auto-create maintenance ticket', {
      error: err.message,
      incidentId: incident.id,
    });
    return null;
  }
}
