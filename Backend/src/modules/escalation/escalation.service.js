import prisma from '../../shared/prisma.js';
import logger from '../../config/logger.js';
import { escalationQueue } from '../../queues/queue-client.js';
import { NotFoundError } from '../../shared/errors.js';

export async function scheduleEscalation(incident) {
  const rules = await prisma.escalationRule.findMany({
    where: { isActive: true },
    orderBy: [{ incidentType: 'asc' }, { severity: 'asc' }],
  });

  const matchingRule = rules.find(
    (r) =>
      (r.incidentType === incident.type || r.incidentType === null) &&
      (r.severity === incident.severity || r.severity === null)
  );

  if (!matchingRule) {
    logger.warn('No escalation rule found', {
      type: incident.type,
      severity: incident.severity,
    });
    return;
  }

  const jobId = `escalation:${incident.id}:tier1`;
  const delay = matchingRule.windowSeconds * 1000;

  await escalationQueue.add(
    jobId,
    { incidentId: incident.id, tier: 1, ruleId: matchingRule.id },
    { delay, jobId }
  );

  logger.info('Escalation scheduled', {
    incidentId: incident.id,
    ruleId: matchingRule.id,
    delay,
  });
}

export async function cancelEscalation(incidentId) {
  const jobIds = [
    `escalation:${incidentId}:tier1`,
    `escalation:${incidentId}:tier2`,
  ];

  for (const jobId of jobIds) {
    const job = await escalationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info('Escalation job cancelled', { jobId });
    }
  }
}

export async function getRules() {
  return prisma.escalationRule.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function createRule(data, createdById) {
  return prisma.escalationRule.create({
    data: { ...data, createdById },
  });
}

export async function updateRule(id, data) {
  const rule = await prisma.escalationRule.findUnique({ where: { id } });
  if (!rule) {
    throw new NotFoundError('Escalation rule not found');
  }

  return prisma.escalationRule.update({ where: { id }, data });
}

export async function deleteRule(id) {
  const rule = await prisma.escalationRule.findUnique({ where: { id } });
  if (!rule) {
    throw new NotFoundError('Escalation rule not found');
  }

  await prisma.escalationRule.delete({ where: { id } });
}
