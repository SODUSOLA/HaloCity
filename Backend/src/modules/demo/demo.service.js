import prisma from '../../shared/prisma.js';
import { generateReferenceCode, classifySeverity } from '../incidents/incidents.helpers.js';
import { emitIncidentCreated, emitIncidentUpdated } from '../../websocket/socket-events.js';
import { dispatch } from '../notifications/notifications.service.js';
import { scheduleEscalation } from '../escalation/escalation.service.js';
import { createFromIncident } from '../maintenance/maintenance.service.js';

const TYPES = ['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE'];
const TITLE_POOL = {
  MEDICAL: ['Patient collapsed at market', 'Road traffic injury', 'Pregnant woman in distress', 'Choking child needs help', 'Mass fainting at event'],
  SECURITY: ['Suspicious package spotted', 'Attempted break-in reported', 'Street fight in progress', 'Vandalism underway', 'Stolen vehicle reported'],
  TRAFFIC: ['Major gridlock at junction', 'Road blocked by fallen tree', 'Accident causing delay', 'Broken down truck blocking lane', 'Traffic light malfunction'],
  INFRASTRUCTURE: ['Power line down', 'Water pipe burst', 'Street light out', 'Road surface collapsed', 'Drainage blocked'],
};

export async function simulateIncident(adminId) {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const title = TITLE_POOL[type][Math.floor(Math.random() * TITLE_POOL[type].length)];
  const severity = classifySeverity(type, title, '');

  const zones = await prisma.zone.findMany({ where: { isActive: true } });
  if (zones.length === 0) throw new Error('No active zones found');
  const zone = zones[Math.floor(Math.random() * zones.length)];

  const citizens = await prisma.user.findMany({
    where: { role: 'CITIZEN', isActive: true },
    take: 10,
  });
  const reporter = citizens.length > 0
    ? citizens[Math.floor(Math.random() * citizens.length)]
    : null;

  const referenceCode = await generateReferenceCode();

  const incident = await prisma.incident.create({
    data: {
      referenceCode,
      type,
      severity,
      title,
      description: `[Demo] ${title} in ${zone.name}`,
      zoneId: zone.id,
      reporterId: reporter?.id || adminId,
      locationLat: zone.coordinates?.lat || 6.5244 + (Math.random() - 0.5) * 0.05,
      locationLng: zone.coordinates?.lng || 3.3792 + (Math.random() - 0.5) * 0.05,
      status: 'PENDING',
    },
    include: {
      zone: { select: { id: true, name: true, code: true } },
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  scheduleEscalation(incident).catch(() => {});
  emitIncidentCreated(incident);

  if (incident.type === 'INFRASTRUCTURE') {
    createFromIncident(incident).catch(() => {});
  }

  dispatch({
    userId: adminId,
    type: 'SYSTEM',
    channel: 'WEBSOCKET',
    title: 'Demo Incident Created',
    body: `Simulated ${type} incident ${referenceCode} in ${zone.name}`,
    referenceId: incident.id,
    referenceType: 'incident',
  }).catch(() => {});

  return incident;
}

export async function clearNonFinal() {
  const result = await prisma.incident.updateMany({
    where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
    data: { status: 'CLOSED', resolvedAt: new Date() },
  });

  const cleared = await prisma.incident.findMany({
    where: { status: 'CLOSED', resolvedAt: { not: null } },
    orderBy: { updatedAt: 'desc' },
    take: result.count,
    include: {
      zone: { select: { id: true, name: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  for (const inc of cleared) {
    emitIncidentUpdated(inc);
  }

  return { closed: result.count };
}
