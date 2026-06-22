import prisma from '../../shared/prisma.js';
import redis from '../../config/redis.js';
import logger from '../../config/logger.js';
import { generateReferenceCode, classifySeverity } from '../incidents/incidents.helpers.js';
import { emitIncidentCreated } from '../../websocket/socket-events.js';
import { scheduleEscalation } from '../escalation/escalation.service.js';

const TYPE_MAP = { '1': 'MEDICAL', '2': 'SECURITY', '3': 'TRAFFIC', '4': 'INFRASTRUCTURE' };
const SESSION_TTL = 600;

async function getActiveZones() {
  const cached = await redis.get('ussd:zones');
  if (cached) return JSON.parse(cached);

  const zones = await prisma.zone.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });

  await redis.setex('ussd:zones', 300, JSON.stringify(zones));
  return zones;
}

async function findOrCreateUssdUser(phoneNumber) {
  const sanitizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  let user = await prisma.user.findFirst({ where: { phone: sanitizedPhone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: `USSD User (${phoneNumber})`,
        email: `ussd-${phoneNumber.replace(/[^0-9]/g, '')}@halocity.ussd`,
        phone: sanitizedPhone,
        passwordHash: 'USSD_NO_PASSWORD',
        role: 'CITIZEN',
      },
    });
  }
  return user;
}

export async function handleUssd({ sessionId, phoneNumber, text }) {
  const inputs = text.split('*').filter(Boolean);
  const level = inputs.length;

  if (level === 0) {
    return {
      type: 'CON',
      message: 'Welcome to HaloCity Emergency\n1. Report Emergency\n2. Check My Report Status',
    };
  }

  if (level === 1 && inputs[0] === '1') {
    return {
      type: 'CON',
      message: 'Select incident type:\n1. Medical\n2. Security\n3. Traffic\n4. Infrastructure',
    };
  }

  if (level === 1 && inputs[0] === '2') {
    const sanitizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const user = await prisma.user.findFirst({ where: { phone: sanitizedPhone, deletedAt: null } });
    if (!user) {
      return { type: 'END', message: 'No reports found for this number.' };
    }

    const last = await prisma.incident.findFirst({
      where: { reporterId: user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!last) {
      return { type: 'END', message: 'You have no reports yet.' };
    }

    return {
      type: 'END',
      message: `Last report:\n${last.referenceCode}\nStatus: ${last.status.replace('_', ' ')}`,
    };
  }

  if (level === 2 && inputs[0] === '1') {
    const zones = await getActiveZones();
    const zoneMenu = zones.map((z, i) => `${i + 1}. ${z.name}`).join('\n');
    return {
      type: 'CON',
      message: `Your zone:\n${zoneMenu}`,
    };
  }

  if (level === 3 && inputs[0] === '1') {
    const type = TYPE_MAP[inputs[1]];
    const zones = await getActiveZones();
    const zoneIndex = parseInt(inputs[2]) - 1;
    const zone = zones[zoneIndex];

    if (!type || !zone) {
      return { type: 'END', message: 'Invalid selection. Please try again.' };
    }

    try {
      const user = await findOrCreateUssdUser(phoneNumber);
      const referenceCode = await generateReferenceCode();
      const severity = classifySeverity(type, `USSD Emergency Report - ${type}`, '');

      const incident = await prisma.incident.create({
        data: {
          referenceCode,
          type,
          severity,
          title: `USSD Emergency Report - ${type}`,
          description: `Reported via USSD from ${phoneNumber} in ${zone.name}`,
          zoneId: zone.id,
          reporterId: user.id,
          status: 'PENDING',
        },
        include: {
          zone: { select: { id: true, name: true, code: true } },
          reporter: { select: { id: true, name: true } },
        },
      });

      scheduleEscalation(incident).catch(() => {});
      emitIncidentCreated(incident);

      return {
        type: 'END',
        message: `Emergency reported.\nRef: ${incident.referenceCode}\nHelp is coming.`,
      };
    } catch (err) {
      logger.error('USSD incident creation failed', { error: err.message, phoneNumber });
      return { type: 'END', message: 'System error. Please try again.' };
    }
  }

  return { type: 'END', message: 'Invalid input. Please start again.' };
}
