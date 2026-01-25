import { describe, expect, it } from 'vitest';

import {
  changePasswordSchema,
  disable2FASchema,
  enable2FASchema,
  updateProfileSchema,
  verify2FASchema,
} from './settings';

describe('Settings Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('accepts valid profile data', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Ivan Horvat',
        image: 'https://example.com/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('accepts name without image', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Ivan Horvat',
      });
      expect(result.success).toBe(true);
    });

    it('rejects name shorter than 2 characters', () => {
      const result = updateProfileSchema.safeParse({
        name: 'I',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid image URL', () => {
      const result = updateProfileSchema.safeParse({
        name: 'Ivan Horvat',
        image: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('accepts valid password change', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPass123',
        confirmPassword: 'DifferentPass123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('confirmPassword');
      }
    });

    it('rejects weak password without uppercase', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak password without number', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPassword',
        confirmPassword: 'NewPassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'New1',
        confirmPassword: 'New1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('enable2FASchema', () => {
    it('accepts valid password', () => {
      const result = enable2FASchema.safeParse({
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = enable2FASchema.safeParse({
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verify2FASchema', () => {
    it('accepts valid 6-digit code', () => {
      const result = verify2FASchema.safeParse({
        code: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('rejects code with less than 6 digits', () => {
      const result = verify2FASchema.safeParse({
        code: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('rejects code with more than 6 digits', () => {
      const result = verify2FASchema.safeParse({
        code: '1234567',
      });
      expect(result.success).toBe(false);
    });

    it('rejects code with non-numeric characters', () => {
      const result = verify2FASchema.safeParse({
        code: '12345a',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('disable2FASchema', () => {
    it('accepts valid password', () => {
      const result = disable2FASchema.safeParse({
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = disable2FASchema.safeParse({
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
