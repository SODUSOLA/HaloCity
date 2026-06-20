import prisma from '../../shared/prisma.js';
import redis from '../../config/redis.js';
import { parsePagination } from '../../shared/pagination.js';

async function cachedQuery(key, ttl, fn) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

export async function getSummary() {
  return cachedQuery('dashboard:summary', 30, async () => {
    const [typeCounts, severityCounts, activeMarshals, openTickets] = await Promise.all([
      prisma.incident.groupBy({
        by: ['type'],
        where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
        _count: { id: true },
      }),
      prisma.incident.groupBy({
        by: ['severity'],
        where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
        _count: { id: true },
      }),
      prisma.marshalAssignment.count({ where: { status: 'ACTIVE' } }),
      prisma.maintenanceTicket.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
    ]);

    const zonesUnderStress = await prisma.incident.groupBy({
      by: ['zoneId'],
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] },
      },
      _count: { id: true },
      having: { id: { _count: { gte: 3 } } },
    });

    const totalActive = typeCounts.reduce((sum, t) => sum + t._count.id, 0);

    return {
      totalActiveIncidents: totalActive,
      byType: typeCounts,
      bySeverity: severityCounts,
      activeMarshals,
      zonesUnderStress: zonesUnderStress.length,
      openTickets,
    };
  });
}

export async function getLiveIncidents(query) {
  const { page, limit, skip } = parsePagination(query);

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where: { status: { notIn: ['CLOSED'] } },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
      include: {
        zone: { select: { id: true, name: true, code: true } },
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.incident.count({ where: { status: { notIn: ['CLOSED'] } } }),
  ]);

  return {
    data: incidents,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMarshalMap() {
  return cachedQuery('dashboard:marshals:map', 10, async () => {
    const assignments = await prisma.marshalAssignment.findMany({
      where: { status: 'ACTIVE' },
      include: {
        mayor: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true, code: true } },
      },
    });

    const entries = await Promise.all(
      assignments.map(async (a) => {
        let lat = null;
        let lng = null;
        let lastSeen = null;

        const cached = await redis.get(`marshal:${a.mayorId}:location`);
        if (cached) {
          const loc = JSON.parse(cached);
          lat = loc.lat;
          lng = loc.lng;
          lastSeen = loc.updatedAt;
        } else {
          const dbLoc = await prisma.marshalLocation.findUnique({
            where: { mayorId: a.mayorId },
          });
          if (dbLoc) {
            lat = dbLoc.lat;
            lng = dbLoc.lng;
            lastSeen = dbLoc.updatedAt?.toISOString();
          }
        }

        return {
          mayorId: a.mayorId,
          name: a.mayor.name,
          zoneId: a.zoneId,
          zoneName: a.zone.name,
          lat,
          lng,
          lastSeen,
        };
      })
    );

    return entries;
  });
}

export async function getZoneDensity() {
  return cachedQuery('dashboard:zones:density', 60, async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        capacity: true,
      },
    });

    const densities = await Promise.all(
      zones.map(async (zone) => {
        const incidentCount = await prisma.incident.count({
          where: {
            zoneId: zone.id,
            status: { not: 'CLOSED' },
          },
        });

        const recentCount = await prisma.incident.count({
          where: {
            zoneId: zone.id,
            createdAt: { gte: oneHourAgo },
            status: { not: 'CLOSED' },
          },
        });

        return {
          zoneId: zone.id,
          zoneName: zone.name,
          activeIncidents: incidentCount,
          recentIncidents: recentCount,
          capacity: zone.capacity,
          densityPercent: zone.capacity
            ? Math.round((incidentCount / zone.capacity) * 10000) / 100
            : null,
        };
      })
    );

    return densities;
  });
}

export async function getInfrastructureStatus() {
  return cachedQuery('dashboard:infrastructure', 60, async () => {
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        assets: {
          select: {
            status: true,
          },
        },
      },
    });

    const entries = zones.map((zone) => {
      const counts = {
        operational: 0,
        degraded: 0,
        offline: 0,
        underMaintenance: 0,
      };

      for (const asset of zone.assets) {
        const key = asset.status === 'UNDER_MAINTENANCE'
          ? 'underMaintenance'
          : asset.status.toLowerCase();
        if (key in counts) counts[key]++;
      }

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        ...counts,
        total: zone.assets.length,
      };
    });

    return entries;
  });
}

export async function getPendingEscalations() {
  return cachedQuery('dashboard:escalations', 30, async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [stalePending, escalatedCount, overdue] = await Promise.all([
      prisma.incident.count({
        where: {
          status: 'PENDING',
          createdAt: { lte: fiveMinutesAgo },
        },
      }),
      prisma.incident.count({
        where: { status: 'ESCALATED' },
      }),
      prisma.incident.findMany({
        where: {
          status: 'PENDING',
          createdAt: { lte: fiveMinutesAgo },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
        include: {
          zone: { select: { id: true, name: true } },
          reporter: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      stalePendingCount: stalePending,
      escalatedCount,
      mostOverdue: overdue,
    };
  });
}
