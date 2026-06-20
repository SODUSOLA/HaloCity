import prisma from '../../shared/prisma.js';
import redis from '../../config/redis.js';
import logger from '../../config/logger.js';
import { NotFoundError, ConflictError } from '../../shared/errors.js';
import { emitMarshalAssigned, emitMarshalLocationUpdated, emitZoneAlert } from '../../websocket/socket-events.js';
import { getIO } from '../../websocket/socket.js';
import { dispatch } from '../notifications/notifications.service.js';

export async function assignMarshal(adminId, data) {
  const mayor = await prisma.user.findFirst({
    where: { id: data.mayorId, role: 'MAYOR' },
  });

  if (!mayor) {
    throw new NotFoundError('Mayor not found');
  }

  const zone = await prisma.zone.findUnique({
    where: { id: data.zoneId, isActive: true },
  });

  if (!zone) {
    throw new NotFoundError('Zone not found or inactive');
  }

  const existing = await prisma.marshalAssignment.findFirst({
    where: { mayorId: data.mayorId, zoneId: data.zoneId, status: 'ACTIVE' },
  });

  if (existing) {
    throw new ConflictError('Mayor already has an active assignment in this zone');
  }

  const assignment = await prisma.marshalAssignment.create({
    data: {
      mayorId: data.mayorId,
      zoneId: data.zoneId,
      assignedById: adminId,
      instructions: data.instructions,
      startTime: data.startTime ? new Date(data.startTime) : new Date(),
    },
    include: {
      mayor: { select: { id: true, name: true, phone: true } },
      zone: { select: { id: true, name: true, code: true } },
    },
  });

  await prisma.user.update({
    where: { id: data.mayorId },
    data: { zoneId: data.zoneId },
  });

  await redis.sadd(`zone:${data.zoneId}:marshals`, data.mayorId);

  emitMarshalAssigned(data.mayorId, assignment);

  dispatch({
    userId: data.mayorId,
    type: 'ASSIGNMENT',
    channel: 'SMS',
    title: 'Marshal Assignment',
    body: `[HaloCity] You have been assigned to ${zone.name} (${zone.code}). ${data.instructions ? 'Instructions: ' + data.instructions : ''}`,
    referenceId: assignment.id,
    referenceType: 'assignment',
  }).catch(() => {});

  return assignment;
}

export async function updateLocation(mayorId, data) {
  await prisma.marshalLocation.upsert({
    where: { mayorId },
    update: { lat: data.lat, lng: data.lng, accuracy: data.accuracy || null },
    create: { mayorId, lat: data.lat, lng: data.lng, accuracy: data.accuracy || null },
  });

  const locationData = JSON.stringify({
    lat: data.lat,
    lng: data.lng,
    accuracy: data.accuracy || null,
    updatedAt: new Date().toISOString(),
  });

  await redis.setex(`marshal:${mayorId}:location`, 300, locationData);

  const assignment = await prisma.marshalAssignment.findFirst({
    where: { mayorId, status: 'ACTIVE' },
    select: { zoneId: true },
  });

  emitMarshalLocationUpdated(mayorId, assignment?.zoneId || null, data.lat, data.lng);
}

export async function getAllMarshals() {
  const users = await prisma.user.findMany({
    where: { role: 'MAYOR' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
    },
  });

  const enriched = await Promise.all(
    users.map(async (user) => {
      const assignment = await prisma.marshalAssignment.findFirst({
        where: { mayorId: user.id, status: 'ACTIVE' },
        select: {
          id: true,
          zone: { select: { id: true, name: true, code: true } },
          startTime: true,
        },
      });

      let location = null;
      const cached = await redis.get(`marshal:${user.id}:location`);
      if (cached) {
        location = JSON.parse(cached);
      } else {
        const dbLoc = await prisma.marshalLocation.findUnique({
          where: { mayorId: user.id },
        });
        if (dbLoc) {
          location = {
            lat: dbLoc.lat,
            lng: dbLoc.lng,
            accuracy: dbLoc.accuracy,
            updatedAt: dbLoc.updatedAt?.toISOString(),
          };
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        currentAssignment: assignment || null,
        zone: assignment?.zone || null,
        location,
      };
    })
  );

  return enriched;
}

export async function getActiveMarshals() {
  const assignments = await prisma.marshalAssignment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      mayor: { select: { id: true, name: true, phone: true, email: true } },
      zone: { select: { id: true, name: true, code: true } },
    },
  });

  const enriched = await Promise.all(
    assignments.map(async (a) => {
      let location = null;

      const cached = await redis.get(`marshal:${a.mayorId}:location`);
      if (cached) {
        location = JSON.parse(cached);
      } else {
        const dbLoc = await prisma.marshalLocation.findUnique({
          where: { mayorId: a.mayorId },
        });
        if (dbLoc) {
          location = {
            lat: dbLoc.lat,
            lng: dbLoc.lng,
            accuracy: dbLoc.accuracy,
            updatedAt: dbLoc.updatedAt?.toISOString(),
          };
        }
      }

      return { ...a, location };
    })
  );

  return enriched;
}

export async function getMarshalsByZone(zoneId) {
  const assignments = await prisma.marshalAssignment.findMany({
    where: { zoneId, status: 'ACTIVE' },
    include: {
      mayor: { select: { id: true, name: true, phone: true } },
      zone: { select: { id: true, name: true, code: true } },
    },
  });

  const enriched = await Promise.all(
    assignments.map(async (a) => {
      let location = null;

      const cached = await redis.get(`marshal:${a.mayorId}:location`);
      if (cached) {
        location = JSON.parse(cached);
      } else {
        const dbLoc = await prisma.marshalLocation.findUnique({
          where: { mayorId: a.mayorId },
        });
        if (dbLoc) {
          location = {
            lat: dbLoc.lat,
            lng: dbLoc.lng,
            accuracy: dbLoc.accuracy,
            updatedAt: dbLoc.updatedAt?.toISOString(),
          };
        }
      }

      return { ...a, location };
    })
  );

  return enriched;
}

export async function dispatchCorridor(adminId, data) {
  for (const zoneId of data.zoneIds) {
    const mayorIds = await redis.smembers(`zone:${zoneId}:marshals`);

    emitZoneAlert(zoneId, data.message, data.priority);

    for (const mayorId of mayorIds) {
      dispatch({
        userId: mayorId,
        type: 'ALERT',
        channel: 'SMS',
        title: 'Corridor Alert',
        body: `[HaloCity] ${data.message}`,
        referenceId: data.incidentId,
        referenceType: 'incident',
      }).catch(() => {});
    }

    // Notify citizens in the zone
    const citizenIds = await prisma.incident.findMany({
      where: { zoneId, reporterId: { not: null } },
      select: { reporterId: true },
      distinct: ['reporterId'],
    });
    for (const { reporterId } of citizenIds) {
      getIO().to(`citizen:${reporterId}`).emit('zone:alert', { zoneId, message: data.message, priority: data.priority });
      dispatch({
        userId: reporterId,
        type: 'ALERT',
        channel: 'WEBSOCKET',
        title: 'Corridor Alert',
        body: `[HaloCity] ${data.message}`,
        referenceId: data.incidentId,
        referenceType: 'incident',
      }).catch(() => {});
    }
  }

  if (data.incidentId) {
    await prisma.escalationLog.create({
      data: {
        incidentId: data.incidentId,
        fromStatus: null,
        toStatus: 'IN_PROGRESS',
        reason: `Corridor instruction: ${data.message}`,
        triggeredAt: new Date(),
      },
    });
  }
}

export async function getMyAssignment(mayorId) {
  const assignment = await prisma.marshalAssignment.findFirst({
    where: { mayorId, status: 'ACTIVE' },
    include: {
      zone: { select: { id: true, name: true, code: true, capacity: true } },
      assignedBy: { select: { id: true, name: true } },
    },
  });

  let location = null;

  const cached = await redis.get(`marshal:${mayorId}:location`);
  if (cached) {
    location = JSON.parse(cached);
  } else {
    const dbLoc = await prisma.marshalLocation.findUnique({
      where: { mayorId },
    });
    if (dbLoc) {
      location = { lat: dbLoc.lat, lng: dbLoc.lng, accuracy: dbLoc.accuracy, updatedAt: dbLoc.updatedAt };
    }
  }

  return assignment ? { ...assignment, location } : null;
}

export async function endAssignment(assignmentId) {
  const assignment = await prisma.marshalAssignment.findUnique({
    where: { id: assignmentId },
    include: { mayor: true, zone: true },
  });

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  const updated = await prisma.marshalAssignment.update({
    where: { id: assignmentId },
    data: { status: 'COMPLETED', endTime: new Date() },
  });

  await prisma.user.update({
    where: { id: assignment.mayorId },
    data: { zoneId: null },
  });

  await redis.srem(`zone:${assignment.zoneId}:marshals`, assignment.mayorId);
  await redis.del(`marshal:${assignment.mayorId}:location`);

  return updated;
}
