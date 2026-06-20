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

let mayorToken = '';
let adminToken = '';

beforeAll(async () => {
  const mayorLogin = await api('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'marshal@test.com', password: 'Test1234' }),
  });
  mayorToken = mayorLogin.body.data.token;

  const adminLogin = await api('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@halocity.ng', password: 'HaloCity@2026' }),
  });
  adminToken = adminLogin.body.data.token;
});

describe('Marshals Routes', () => {
  describe('GET /api/v1/marshals', () => {
    it('returns marshal list', async () => {
      const { status, body } = await api('/api/v1/marshals', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('requires authentication', async () => {
      const { status } = await api('/api/v1/marshals');
      expect(status).toBe(401);
    });
  });

  describe('GET /api/v1/marshals/me', () => {
    it('returns current marshal assignment for mayor', async () => {
      const { status } = await api('/api/v1/marshals/me', {
        headers: { Authorization: `Bearer ${mayorToken}` },
      });
      expect(status).toBe(200);
    });
  });

  describe('PATCH /api/v1/marshals/location', () => {
    it('updates marshal location (MAYOR role)', async () => {
      const { status } = await api('/api/v1/marshals/location', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${mayorToken}` },
        body: JSON.stringify({ lat: 6.5244, lng: 3.3792, status: 'AVAILABLE' }),
      });
      expect(status).toBe(200);
    });

    it('rejects location update from non-mayor', async () => {
      const { status } = await api('/api/v1/marshals/location', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ lat: 6.5244, lng: 3.3792 }),
      });
      expect(status).toBe(403);
    });

    it('rejects location update without auth', async () => {
      const { status } = await api('/api/v1/marshals/location', {
        method: 'PATCH',
        body: JSON.stringify({ lat: 6.5, lng: 3.3 }),
      });
      expect(status).toBe(401);
    });
  });
});
