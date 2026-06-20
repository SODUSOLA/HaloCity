import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';

const BASE = 'http://localhost:5001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await res.json();
  return { status: res.status, body };
}

let citizenToken = '';
let incidentId = '';
const testEmail = `inc-test-${randomUUID().slice(0, 8)}@halocity.test';

beforeAll(async () => {
  const reg = await api('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Incident Tester',
      email: testEmail,
      phone: '+2348123456789',
      password: 'Test1234',
      role: 'CITIZEN',
    }),
  });
  citizenToken = reg.body.data.token;
});

describe('Incidents Routes', () => {
  describe('POST /api/v1/incidents', () => {
    it('creates a new incident as authenticated user', async () => {
      const { status, body } = await api('/api/v1/incidents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${citizenToken}` },
        body: JSON.stringify({
          title: 'Test Fire Incident',
          description: 'A test fire near zone 1',
          type: 'FIRE',
          severity: 'HIGH',
          location: 'Test Location, Zone 1',
        }),
      });
      expect(status).toBe(201);
      expect(body.data).toHaveProperty('id');
      expect(body.data.title).toBe('Test Fire Incident');
      incidentId = body.data.id;
    });

    it('rejects incident creation without auth', async () => {
      const { status } = await api('/api/v1/incidents', {
        method: 'POST',
        body: JSON.stringify({ title: 'Unauth', type: 'FIRE' }),
      });
      expect(status).toBe(401);
    });

    it('rejects incident with missing title', async () => {
      const { status } = await api('/api/v1/incidents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${citizenToken}` },
        body: JSON.stringify({ type: 'FIRE' }),
      });
      expect(status).toBe(400);
    });
  });

  describe('GET /api/v1/incidents', () => {
    it('returns incidents list', async () => {
      const { status, body } = await api('/api/v1/incidents', {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('includes the newly created incident', async () => {
      const { body } = await api('/api/v1/incidents', {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const ids = body.data.map((i) => i.id);
      expect(ids).toContain(incidentId);
    });

    it('filters by status', async () => {
      const { status, body } = await api('/api/v1/incidents?status=PENDING', {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      expect(status).toBe(200);
      body.data.forEach((inc) => {
        expect(inc.status).toBe('PENDING');
      });
    });
  });
});
