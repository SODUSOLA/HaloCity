import { getIO } from './socket.js';

export function emitIncidentCreated(incident) {
  const io = getIO();

  const payload = {
    id: incident.id,
    type: incident.type,
    severity: incident.severity,
    zoneId: incident.zoneId,
    status: incident.status,
    referenceCode: incident.referenceCode,
    title: incident.title,
    createdAt: incident.createdAt,
  };

  io.to('admin').emit('incident:created', payload);

  if (incident.zoneId) {
    io.to(`zone:${incident.zoneId}`).emit('incident:created', payload);
  }
}

export function emitIncidentUpdated(incident) {
  const io = getIO();

  const payload = {
    id: incident.id,
    status: incident.status,
    assignedTo: incident.assignedTo,
    updatedAt: incident.updatedAt,
  };

  io.to('admin').emit('incident:updated', payload);
  io.to(`citizen:${incident.reporterId}`).emit('incident:updated', payload);
  if (incident.zoneId) {
    io.to(`zone:${incident.zoneId}`).emit('incident:updated', payload);
  }
  if (incident.assignedTo) {
    io.to(`mayor:${incident.assignedTo}`).emit('incident:updated', payload);
  }
}

export function emitIncidentEscalated(incident, tier) {
  const io = getIO();

  const payload = {
    id: incident.id,
    previousStatus: incident.status,
    escalatedTo: tier === 1 ? 'MAYOR' : 'ADMIN',
    tier,
  };

  io.to('admin').emit('incident:escalated', payload);

  if (tier === 1) {
    if (incident.zoneId) {
      io.to(`zone:${incident.zoneId}`).emit('incident:escalated', payload);
    }
    if (incident.assignedTo) {
      io.to(`mayor:${incident.assignedTo}`).emit('incident:escalated', payload);
    }
  }
}

export function emitMarshalAssigned(mayorId, assignment) {
  const io = getIO();
  io.to(`mayor:${mayorId}`).emit('marshal:assigned', assignment);
}

export function emitMarshalLocationUpdated(mayorId, zoneId, lat, lng) {
  const io = getIO();
  io.to('admin').emit('marshal:location_updated', { mayorId, zoneId, lat, lng });
}

export function emitZoneAlert(zoneId, message, priority) {
  const io = getIO();
  io.to('admin').emit('zone:alert', { zoneId, message, priority });
  io.to(`zone:${zoneId}`).emit('zone:alert', { zoneId, message, priority });
}
