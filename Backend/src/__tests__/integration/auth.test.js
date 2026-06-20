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

const TEST_EMAIL = `test-${randomUUID().slice(0, 8)}@halocity.test`;
const TEST_PHONE = '+2348012345678';
const TEST_PASSWORD = 'Test1234';

describe('Auth Routes', () => {
  let token = '';
  let userId = '';

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user with valid data', async () => {
      const { status, body } = await api('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: TEST_EMAIL,
          phone: TEST_PHONE,
          password: TEST_PASSWORD,
          role: 'CITIZEN',
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('user');
      expect(body.data.user.email).toBe(TEST_EMAIL);
      expect(body.data.user.role).toBe('CITIZEN');
      expect(body.data.user).not.toHaveProperty('passwordHash');

      token = body.data.token;
      userId = body.data.user.id;
    });

    it('rejects registration without phone', async () => {
      const { status } = await api('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'No Phone',
          email: `nophone-${randomUUID().slice(0, 8)}@test.com`,
          password: TEST_PASSWORD,
        }),
      });
      expect(status).toBe(400);
    });

    it('rejects registration with invalid email', async () => {
      const { status } = await api('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Bad Email',
          email: 'not-an-email',
          phone: '+2348123456789',
          password: TEST_PASSWORD,
        }),
      });
      expect(status).toBe(400);
    });

    it('rejects registration with short password', async () => {
      const { status } = await api('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Weak',
          email: `weak-${randomUUID().slice(0, 8)}@test.com`,
          phone: '+2348123456789',
          password: '123',
        }),
      });
      expect(status).toBe(400);
    });

    it('rejects duplicate email registration', async () => {
      const { status } = await api('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Duplicate',
          email: TEST_EMAIL,
          phone: '+2348155566677',
          password: TEST_PASSWORD,
        }),
      });
      expect(status).toBe(409);
    });

    it('rejects duplicate phone registration', async () => {
      const { status } = await api('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Dup Phone',
          email: `dupphone-${randomUUID().slice(0, 8)}@test.com`,
          phone: TEST_PHONE,
          password: TEST_PASSWORD,
        }),
      });
      expect(status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const { status, body } = await api('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      });
      expect(status).toBe(200);
      expect(body.data).toHaveProperty('token');
      expect(body.data.user.email).toBe(TEST_EMAIL);
    });

    it('rejects login with wrong password', async () => {
      const { status } = await api('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: TEST_EMAIL, password: 'WrongPassword1' }),
      });
      expect(status).toBe(401);
    });

    it('rejects login with non-existent email', async () => {
      const { status } = await api('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'nobody@test.com', password: TEST_PASSWORD }),
      });
      expect(status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns user profile with valid token', async () => {
      const { status, body } = await api('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(status).toBe(200);
      expect(body.data.email).toBe(TEST_EMAIL);
      expect(body.data).not.toHaveProperty('passwordHash');
    });

    it('rejects without token', async () => {
      const { status } = await api('/api/v1/auth/me');
      expect(status).toBe(401);
    });

    it('rejects with invalid token', async () => {
      const { status } = await api('/api/v1/auth/me', {
        headers: { Authorization: 'Bearer invalid-token-here' },
      });
      expect(status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/users', () => {
    it('returns users list for admin', async () => {
      const login = await api('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@halocity.ng', password: 'HaloCity@2026' }),
      });
      const adminToken = login.body.data.token;

      const { status, body } = await api('/api/v1/auth/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('rejects users list for non-admin', async () => {
      const { status } = await api('/api/v1/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(status).toBe(403);
    });
  });
});
