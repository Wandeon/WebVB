import { describe, expect, it } from 'vitest';

import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from './user';

describe('createUserSchema', () => {
  it('validates valid user data', () => {
    const validUser = {
      name: 'Ivan Horvat',
      email: 'ivan.horvat@example.com',
      password: 'sigurna123',
      role: 'admin',
    };

    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const invalidUser = {
      name: 'I',
      email: 'ivan.horvat@example.com',
      password: 'sigurna123',
      role: 'admin',
    };

    const result = createUserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Ime mora imati najmanje 2 znaka'
      );
    }
  });

  it('rejects invalid email format', () => {
    const invalidUser = {
      name: 'Ivan Horvat',
      email: 'not-an-email',
      password: 'sigurna123',
      role: 'admin',
    };

    const result = createUserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Neispravan format email adrese'
      );
    }
  });

  it('rejects password shorter than 8 characters', () => {
    const invalidUser = {
      name: 'Ivan Horvat',
      email: 'ivan.horvat@example.com',
      password: 'short',
      role: 'admin',
    };

    const result = createUserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Lozinka mora imati najmanje 8 znakova'
      );
    }
  });

  it('rejects invalid role', () => {
    const invalidUser = {
      name: 'Ivan Horvat',
      email: 'ivan.horvat@example.com',
      password: 'sigurna123',
      role: 'invalid_role',
    };

    const result = createUserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
    if (!result.success) {
      // errorMap is applied to the role field validation error
      expect(result.error.issues[0]?.path).toContain('role');
    }
  });

  it('accepts all valid roles', () => {
    const roles = ['super_admin', 'admin', 'staff'];

    for (const role of roles) {
      const user = {
        name: 'Ivan Horvat',
        email: 'ivan.horvat@example.com',
        password: 'sigurna123',
        role,
      };

      const result = createUserSchema.safeParse(user);
      expect(result.success).toBe(true);
    }
  });
});

describe('updateUserSchema', () => {
  it('allows partial updates with only name', () => {
    const partialUpdate = {
      name: 'Novo Ime',
    };

    const result = updateUserSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only email', () => {
    const partialUpdate = {
      email: 'novi.email@example.com',
    };

    const result = updateUserSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only role', () => {
    const partialUpdate = {
      role: 'staff',
    };

    const result = updateUserSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('allows active status change', () => {
    const updateActive = {
      active: false,
    };

    const result = updateUserSchema.safeParse(updateActive);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(false);
    }
  });

  it('allows empty object', () => {
    const emptyUpdate = {};

    const result = updateUserSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  it('allows multiple fields to be updated', () => {
    const multipleUpdate = {
      name: 'Novo Ime',
      email: 'novi.email@example.com',
      role: 'admin',
      active: true,
    };

    const result = updateUserSchema.safeParse(multipleUpdate);
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters when provided', () => {
    const invalidUpdate = {
      name: 'I',
    };

    const result = updateUserSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Ime mora imati najmanje 2 znaka'
      );
    }
  });

  it('rejects invalid email when provided', () => {
    const invalidUpdate = {
      email: 'not-an-email',
    };

    const result = updateUserSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Neispravan format email adrese'
      );
    }
  });
});

describe('userQuerySchema', () => {
  it('provides default values', () => {
    const result = userQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it('coerces string page to number', () => {
    const result = userQuerySchema.safeParse({ page: '5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
    }
  });

  it('coerces string limit to number', () => {
    const result = userQuerySchema.safeParse({ limit: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });

  it('rejects page less than 1', () => {
    const result = userQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = userQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('parses active filter as true', () => {
    const result = userQuerySchema.safeParse({ active: 'true' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(true);
    }
  });

  it('parses active filter as false', () => {
    const result = userQuerySchema.safeParse({ active: 'false' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(false);
    }
  });

  it('accepts valid role filter', () => {
    const roles = ['super_admin', 'admin', 'staff'];

    for (const role of roles) {
      const result = userQuerySchema.safeParse({ role });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(role);
      }
    }
  });

  it('rejects invalid role filter', () => {
    const result = userQuerySchema.safeParse({ role: 'invalid_role' });
    expect(result.success).toBe(false);
  });

  it('accepts search string', () => {
    const result = userQuerySchema.safeParse({ search: 'ivan' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe('ivan');
    }
  });

  it('accepts all filters together', () => {
    const result = userQuerySchema.safeParse({
      page: '2',
      limit: '20',
      search: 'ivan',
      role: 'admin',
      active: 'true',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
      expect(result.data.search).toBe('ivan');
      expect(result.data.role).toBe('admin');
      expect(result.data.active).toBe(true);
    }
  });
});
