import { describe, it, expect } from 'vitest';
import { z, ZodError } from 'zod';

describe('Zod Error Handling', () => {
  it('ZodError has expected structure', () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.errors).toBeInstanceOf(Array);
      expect(result.error.errors.length).toBeGreaterThan(0);
      expect(result.error.errors[0]).toHaveProperty('message');
      expect(result.error.errors[0]).toHaveProperty('path');
    }
  });

  it('nested object validation works', () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
        age: z.number().min(0).max(150),
      }),
    });

    const result = schema.safeParse({ user: { email: 'bad', age: -1 } });
    expect(result.success).toBe(false);
  });
});
