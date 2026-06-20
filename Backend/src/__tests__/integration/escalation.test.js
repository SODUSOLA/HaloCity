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

describe('Escalation Routes', () => {
  describe('GET /api/v1/escalation/rules', () => {
    it('returns escalation rules', async () => {
      const { status, body } = await api('/api/v1/escalation/rules', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/escalation/logs', () => {
    it('returns escalation logs', async () => {
      const { status, body } = await api('/api/v1/escalation/logs', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
