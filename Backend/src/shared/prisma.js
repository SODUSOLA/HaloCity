import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const SOFT_DELETE_MODELS = ['User', 'Zone', 'Incident', 'Asset', 'MaintenanceTicket'];

function isSoftDeleteModel(model) {
  return SOFT_DELETE_MODELS.includes(model);
}

function excludeDeleted(args) {
  const { includeDeleted, ...rest } = args || {};
  if (includeDeleted) return rest;
  const where = { ...(rest.where || {}) };
  if (!('deletedAt' in where)) {
    where.deletedAt = null;
  }
  return { ...rest, where };
}

function createExtendedClient() {
  const base = new PrismaClient();
  return base.$extends({
    query: {
      $allModels: {
        async findUnique({ model, args, query }) {
          if (!isSoftDeleteModel(model)) return query(args);
          return query(excludeDeleted(args));
        },
        async findFirst({ model, args, query }) {
          if (!isSoftDeleteModel(model)) return query(args);
          return query(excludeDeleted(args));
        },
        async findMany({ model, args, query }) {
          if (!isSoftDeleteModel(model)) return query(args);
          return query(excludeDeleted(args));
        },
        async count({ model, args, query }) {
          if (!isSoftDeleteModel(model)) return query(args);
          return query(excludeDeleted(args));
        },
      },
    },
  });
}

const prisma = globalForPrisma.__prisma || createExtendedClient();

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
