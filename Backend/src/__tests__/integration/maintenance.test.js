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

describe('Maintenance Routes', () => {
  describe('GET /api/v1/maintenance/assets', () => {
    it('returns maintenance assets', async () => {
      const { status, body } = await api('/api/v1/maintenance/assets', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('assets have expected fields', async () => {
      const { body } = await api('/api/v1/maintenance/assets', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('id');
        expect(body.data[0]).toHaveProperty('name');
      }
    });
  });

  describe('GET /api/v1/maintenance/tickets', () => {
    it('returns maintenance tickets', async () => {
      const { status, body } = await api('/api/v1/maintenance/tickets', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
