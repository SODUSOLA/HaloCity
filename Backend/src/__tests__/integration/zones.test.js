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

let adminToken = '';
let citizenToken = '';

beforeAll(async () => {
  const adminLogin = await api('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@halocity.ng', password: 'HaloCity@2026' }),
  });
  adminToken = adminLogin.body.data.token;

  const testEmail = `zone-test-${randomUUID().slice(0, 8)}@test.com`;
  const citizenReg = await api('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Zone Tester',
      email: testEmail,
      phone: '+2348123456789',
      password: 'Test1234',
      role: 'CITIZEN',
    }),
  });
  citizenToken = citizenReg.body.data.token;
});

describe('Zones Routes', () => {
  describe('GET /api/v1/zones', () => {
    it('returns a list of zones', async () => {
      const { status, body } = await api('/api/v1/zones', {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('returns zones with expected fields', async () => {
      const { body } = await api('/api/v1/zones', {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      if (body.data.length > 0) {
        const zone = body.data[0];
        expect(zone).toHaveProperty('id');
        expect(zone).toHaveProperty('name');
        expect(zone).toHaveProperty('code');
      }
    });

    it('requires authentication', async () => {
      const { status } = await api('/api/v1/zones');
      expect(status).toBe(401);
    });
  });
});
