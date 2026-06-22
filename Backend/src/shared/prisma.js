import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma || new PrismaClient();

const SOFT_DELETE_MODELS = ['User', 'Zone', 'Incident', 'Asset', 'MaintenanceTicket'];

prisma.$use(async (params, next) => {
  if (!SOFT_DELETE_MODELS.includes(params.model)) {
    return next(params);
  }

  const { includeDeleted, ...restArgs } = params.args || {};
  const skipFilter = includeDeleted === true;

  if (['findUnique', 'findFirst', 'findMany', 'count'].includes(params.action)) {
    if (!skipFilter) {
      params.args = {
        ...restArgs,
        where: { ...(restArgs.where || {}), deletedAt: null },
      };
    } else {
      params.args = restArgs;
    }
  }

  if (params.action === 'delete') {
    params.action = 'update';
    params.args = { ...restArgs, data: { deletedAt: new Date(), ...(restArgs.data || {}) } };
  }

  if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    params.args = { ...restArgs, data: { deletedAt: new Date(), ...(restArgs.data || {}) } };
  }

  return next(params);
});

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
