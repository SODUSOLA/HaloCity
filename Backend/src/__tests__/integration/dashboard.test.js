import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:5001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await res.json();
  return { status: res.status, body };
}

let adminToken = '';

beforeAll(async () => {
  const login = await api('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@halocity.ng', password: 'HaloCity@2026' }),
  });
  adminToken = login.body.data.token;
});

describe('Dashboard Routes', () => {
  describe('GET /api/v1/dashboard/summary', () => {
    it('returns dashboard summary', async () => {
      const { status, body } = await api('/api/v1/dashboard/summary', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(body.data).toHaveProperty('totalActiveIncidents');
      expect(body.data).toHaveProperty('activeMarshals');
    });

    it('requires authentication', async () => {
      const { status } = await api('/api/v1/dashboard/summary');
      expect(status).toBe(401);
    });
  });

  describe('GET /api/v1/dashboard/marshals/map', () => {
    it('returns marshal map data', async () => {
      const { status, body } = await api('/api/v1/dashboard/marshals/map', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/incidents/live', () => {
    it('returns live incidents', async () => {
      const { status, body } = await api('/api/v1/dashboard/incidents/live', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/zones/density', () => {
    it('returns zone density data', async () => {
      const { status, body } = await api('/api/v1/dashboard/zones/density', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/infrastructure', () => {
    it('returns infrastructure data', async () => {
      const { status } = await api('/api/v1/dashboard/infrastructure', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
    });
  });

  describe('GET /api/v1/dashboard/escalations', () => {
    it('returns escalation data', async () => {
      const { status } = await api('/api/v1/dashboard/escalations', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
    });
  });
});
