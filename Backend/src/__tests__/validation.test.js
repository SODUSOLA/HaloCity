import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+234[789][01]\d{8}$/, 'Must be a valid Nigerian phone number (+234...)'),
  password: z.string().min(8).regex(/\d/, 'Must contain at least one number'),
  role: z.enum(['CITIZEN', 'MAYOR']).optional().default('CITIZEN'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        password: 'Password1',
        role: 'CITIZEN',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('CITIZEN');
      }
    });

    it('defaults role to CITIZEN', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        password: 'Password1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('CITIZEN');
      }
    });

    it('rejects missing phone', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid phone format', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        phone: '08012345678',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'not-an-email',
        phone: '+2348123456789',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        phone: '+2348123456789',
        password: 'Ab1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        phone: '+2348123456789',
        password: 'Password',
      });
      expect(result.success).toBe(false);
    });

    it('accepts MAYOR role', () => {
      const result = registerSchema.safeParse({
        name: 'Officer',
        email: 'officer@test.com',
        phone: '+2348123456789',
        password: 'Password1',
        role: 'MAYOR',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('MAYOR');
      }
    });

    it('rejects invalid role', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@test.com',
        phone: '+2348123456789',
        password: 'Password1',
        role: 'ADMIN',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name shorter than 2 chars', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'john@test.com',
        phone: '+2348123456789',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name longer than 100 chars', () => {
      const result = registerSchema.safeParse({
        name: 'J' + 'o'.repeat(100),
        email: 'john@test.com',
        phone: '+2348123456789',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'user@test.com',
        password: 'anything',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing email', () => {
      const result = loginSchema.safeParse({ password: 'pass' });
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({ email: 'user@test.com' });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({ email: 'bad', password: 'pass' });
      expect(result.success).toBe(false);
    });
  });
});
