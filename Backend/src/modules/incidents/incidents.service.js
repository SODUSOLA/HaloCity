import prisma from '../../shared/prisma.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js';
import { parsePagination } from '../../shared/pagination.js';
import { generateReferenceCode, classifySeverity, ALLOWED_TRANSITIONS } from './incidents.helpers.js';
import { scheduleEscalation, cancelEscalation } from '../escalation/escalation.service.js';
import { emitIncidentCreated, emitIncidentUpdated } from '../../websocket/socket-events.js';
import { dispatch } from '../notifications/notifications.service.js';
import { createFromIncident } from '../maintenance/maintenance.service.js';

export async function createIncident(reporterId, data) {
  const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
  if (!zone || !zone.isActive) {
    throw new NotFoundError('Zone not found or inactive');
  }

  const referenceCode = await generateReferenceCode();
  const severity = classifySeverity(data.type, data.title, data.description || '');

  const incident = await prisma.incident.create({
    data: {
      referenceCode,
      type: data.type,
      severity,
      title: data.title,
      description: data.description,
      zoneId: data.zoneId,
      reporterId,
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      mediaUrls: data.mediaUrls || [],
      status: 'PENDING',
    },
    include: { zone: true, reporter: { select: { id: true, name: true, email: true } } },
  });

  scheduleEscalation(incident).catch(() => {});
  emitIncidentCreated(incident);

  if (incident.type === 'INFRASTRUCTURE') {
    createFromIncident(incident).catch(() => {});
  }

  return incident;
}

export async function getIncidents(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const { status, type, severity } = query;

  const where = {};

  if (user.role === 'CITIZEN') {
    where.reporterId = user.id;
  } else if (user.role === 'MAYOR') {
    const activeAssignment = await prisma.marshalAssignment.findFirst({
      where: { mayorId: user.id, status: 'ACTIVE' },
      select: { zoneId: true },
    });

    where.OR = [];
    if (activeAssignment?.zoneId) {
      where.OR.push({ zoneId: activeAssignment.zoneId });
    } else if (user.zoneId) {
      where.OR.push({ zoneId: user.zoneId });
    }
    where.OR.push({ assignedTo: user.id });
  }

  if (status) where.status = status;
  if (type) where.type = type;
  if (severity) where.severity = severity;

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        zone: { select: { id: true, name: true, code: true } },
        reporter: { select: { id: true, name: true } },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    data: incidents,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getIncidentById(id, user) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      zone: true,
      reporter: { select: { id: true, name: true, phone: true } },
      assignee: { select: { id: true, name: true } },
      escalationLogs: { orderBy: { triggeredAt: 'desc' } },
    },
  });

  if (!incident) {
    throw new NotFoundError('Incident not found');
  }

  if (user.role === 'CITIZEN' && incident.reporterId !== user.id) {
    throw new ForbiddenError('Access denied');
  }

  if (user.role === 'MAYOR') {
    const activeAssignment = await prisma.marshalAssignment.findFirst({
      where: { mayorId: user.id, status: 'ACTIVE' },
      select: { zoneId: true },
    });
    const zoneId = activeAssignment?.zoneId || user.zoneId;
    if (incident.zoneId !== zoneId && incident.assignedTo !== user.id) {
      throw new ForbiddenError('Access denied');
    }
  }

  return incident;
}

export async function updateStatus(id, user, data) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) {
    throw new NotFoundError('Incident not found');
  }

  if (user.role !== 'ADMIN') {
    const allowed = ALLOWED_TRANSITIONS[incident.status] || [];
    if (!allowed.includes(data.status)) {
      throw new ValidationError(
        `Cannot transition from ${incident.status} to ${data.status}. Allowed: ${allowed.join(', ')}`
      );
    }
  }

  const updateData = { status: data.status };
  if (data.status === 'RESOLVED') {
    updateData.resolvedAt = new Date();
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: updateData,
    include: {
      zone: true,
      reporter: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  cancelEscalation(id).catch(() => {});

  emitIncidentUpdated(updated);

  dispatch({
    userId: incident.reporterId,
    type: 'INCIDENT_UPDATE',
    channel: 'WEBSOCKET',
    title: 'Incident Status Updated',
    body: `Your incident ${incident.referenceCode} is now ${data.status}`,
    referenceId: id,
    referenceType: 'incident',
  }).catch(() => {});

  return updated;
}

export async function assignIncident(id, mayorId) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) {
    throw new NotFoundError('Incident not found');
  }

  const mayor = await prisma.user.findFirst({
    where: { id: mayorId, role: 'MAYOR' },
  });

  if (!mayor) {
    throw new NotFoundError('Mayor not found');
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: { assignedTo: mayorId },
    include: {
      zone: true,
      reporter: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, phone: true } },
    },
  });

  emitIncidentUpdated(updated);

  dispatch({
    userId: mayorId,
    type: 'ASSIGNMENT',
    channel: 'SMS',
    title: 'Incident Assigned',
    body: `[HaloCity] You have been assigned to incident ${incident.referenceCode} (${incident.type}). Zone: ${updated.zone?.name || 'Unknown'}`,
    referenceId: id,
    referenceType: 'incident',
  }).catch(() => {});

  dispatch({
    userId: mayorId,
    type: 'ASSIGNMENT',
    channel: 'WEBSOCKET',
    title: 'Incident Assigned',
    body: `You have been assigned to incident ${incident.referenceCode}`,
    referenceId: id,
    referenceType: 'incident',
  }).catch(() => {});

  return updated;
}
