import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../../config/env.js';
import logger from '../../config/logger.js';
import prisma from '../../shared/prisma.js';
import { escalationQueue } from '../queue-client.js';
import { dispatch } from '../../modules/notifications/notifications.service.js';
import { emitIncidentEscalated, emitIncidentUpdated } from '../../websocket/socket-events.js';

const url = new URL(config.REDIS_URL);
const connection = {
  host: url.hostname || 'localhost',
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
};

async function processEscalation(job) {
  const { incidentId, tier, ruleId } = job.data;

  logger.info('Escalation job fired', { incidentId, tier });

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { zone: true },
  });

  if (!incident) {
    logger.warn('Escalation job: incident not found', { incidentId });
    return;
  }

  if (!['PENDING', 'ESCALATED'].includes(incident.status)) {
    logger.info('Escalation job no-op: incident already progressed', {
      incidentId,
      status: incident.status,
    });
    return;
  }

  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: { status: 'ESCALATED' },
    include: {
      zone: true,
      reporter: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  emitIncidentUpdated(updated);

  await prisma.escalationLog.create({
    data: {
      incidentId,
      ruleId: ruleId || undefined,
      fromStatus: incident.status,
      toStatus: 'ESCALATED',
      reason: `Tier ${tier} escalation - no acknowledgement within window`,
    },
  });

  let targetUsers = [];

  if (tier === 1) {
    targetUsers = await prisma.user.findMany({
      where: {
        role: 'MAYOR',
        zoneId: incident.zoneId,
        isActive: true,
      },
    });
  } else if (tier === 2) {
    targetUsers = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
    });
  }

  for (const user of targetUsers) {
    try {
      await dispatch({
        userId: user.id,
        type: 'ESCALATION',
        channel: 'SMS',
        title: 'Incident Escalated',
        body: `[HaloCity] Incident ${incident.referenceCode} (${incident.type}) escalated to Tier ${tier}. Zone: ${incident.zone?.name || 'Unknown'}. Please respond immediately.`,
        referenceId: incidentId,
        referenceType: 'incident',
      });

      await dispatch({
        userId: user.id,
        type: 'ESCALATION',
        channel: 'WEBSOCKET',
        title: 'Incident Escalated',
        body: `Incident ${incident.referenceCode} escalated to Tier ${tier}`,
        referenceId: incidentId,
        referenceType: 'incident',
      });
    } catch (err) {
      logger.error('Failed to dispatch escalation notification', {
        error: err.message,
        userId: user.id,
      });
    }
  }

  emitIncidentEscalated(incident, tier);

  if (tier < 2) {
    const nextDelay = tier === 1 ? 300 * 1000 : 600 * 1000;
    await escalationQueue.add(
      `escalation:${incidentId}:tier${tier + 1}`,
      { incidentId, tier: tier + 1, ruleId },
      { delay: nextDelay, jobId: `escalation:${incidentId}:tier${tier + 1}` }
    );
  }
}

export function startEscalationWorker() {
  const worker = new Worker('escalation', processEscalation, { connection });

  worker.on('completed', (job) => {
    logger.info('Escalation job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Escalation job failed', { jobId: job?.id, error: err.message });
  });

  logger.info('Escalation worker started');
  return worker;
}
