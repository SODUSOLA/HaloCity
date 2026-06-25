import prisma from '../../shared/prisma.js';

export async function getHourly() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const incidents = await prisma.incident.findMany({
    where: { createdAt: { gte: twentyFourHoursAgo } },
    select: { createdAt: true },
  });

  const hourly = {};
  for (let i = 0; i < 24; i++) {
    const hour = new Date(Date.now() - i * 60 * 60 * 1000);
    const key = hour.toISOString().slice(0, 13) + ':00';
    hourly[key] = 0;
  }

  for (const inc of incidents) {
    const key = inc.createdAt.toISOString().slice(0, 13) + ':00';
    if (hourly[key] !== undefined) {
      hourly[key]++;
    }
  }

  return Object.entries(hourly)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

export async function getZoneHeat() {
  const zones = await prisma.zone.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true, coordinates: true },
  });

  const heatData = await Promise.all(
    zones.map(async (zone) => {
      const [activeCount, totalCount, criticalCount] = await Promise.all([
        prisma.incident.count({
          where: {
            zoneId: zone.id,
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        }),
        prisma.incident.count({ where: { zoneId: zone.id } }),
        prisma.incident.count({
          where: { zoneId: zone.id, severity: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } },
        }),
      ]);

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        zoneCode: zone.code,
        coordinates: zone.coordinates,
        activeIncidents: activeCount,
        totalIncidents: totalCount,
        criticalIncidents: criticalCount,
        heatIndex: activeCount + criticalCount * 2,
      };
    }),
  );

  return heatData.sort((a, b) => b.heatIndex - a.heatIndex);
}

export async function getResponseTimes() {
  const resolved = await prisma.incident.findMany({
    where: { status: { in: ['RESOLVED', 'CLOSED'] }, resolvedAt: { not: null } },
    select: { createdAt: true, acknowledgedAt: true, resolvedAt: true, type: true, severity: true },
  });

  const times = resolved
    .map((inc) => {
      const start = inc.acknowledgedAt || inc.createdAt;
      return {
        ...inc,
        responseMinutes: Math.round(
          (inc.resolvedAt.getTime() - start.getTime()) / 60000,
        ),
      };
    })
    .filter((inc) => inc.responseMinutes >= 0);

  if (times.length === 0) {
    const allIncidents = await prisma.incident.findMany({
      where: { status: { notIn: ['CLOSED'] } },
      select: { type: true, severity: true, status: true },
    });

    return {
      overall: { avg: null, min: null, max: null, sampleSize: 0 },
      byType: {},
      bySeverity: {},
      openCounts: {
        total: allIncidents.length,
        byType: groupBy(allIncidents, 'type'),
        bySeverity: groupBy(allIncidents, 'severity'),
      },
    };
  }

  const avg = Math.round(times.reduce((s, t) => s + t.responseMinutes, 0) / times.length);
  const min = Math.min(...times.map((t) => t.responseMinutes));
  const max = Math.max(...times.map((t) => t.responseMinutes));

  const byType = {};
  const bySeverity = {};

  for (const t of times) {
    if (!byType[t.type]) byType[t.type] = { times: [], count: 0 };
    byType[t.type].times.push(t.responseMinutes);
    byType[t.type].count++;

    if (!bySeverity[t.severity]) bySeverity[t.severity] = { times: [], count: 0 };
    bySeverity[t.severity].times.push(t.responseMinutes);
    bySeverity[t.severity].count++;
  }

  function avgOf(arr) {
    return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  }

  const format = (obj) =>
    Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = { avg: avgOf(val.times), min: Math.min(...val.times), max: Math.max(...val.times), sampleSize: val.count };
      return acc;
    }, {});

  return {
    overall: { avg, min, max, sampleSize: times.length },
    byType: format(byType),
    bySeverity: format(bySeverity),
  };
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
