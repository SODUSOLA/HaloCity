import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await res.json();
  return { status: res.status, body };
}

describe('404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const { status, body } = await api('/api/v1/nonexistent');
    expect(status).toBe(404);
    expect(body.success).toBe(false);
  });
});
