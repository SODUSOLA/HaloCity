import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5001';

describe('Health Check', () => {
  it('GET /health returns 200', async () => {
    const res = await fetch(`${BASE}/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('GET /api/v1/health returns db/redis status', async () => {
    const res = await fetch(`${BASE}/api/v1/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveProperty('db');
    expect(body.data).toHaveProperty('redis');
  });
});
