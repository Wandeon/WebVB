import { describe, expect, it } from 'vitest';

import { hashValue } from '@/lib/pii';

import { sanitizeAuditChanges } from './audit-log-utils';

describe('sanitizeAuditChanges', () => {
  it('redacts sensitive fields while preserving structure', () => {
    const input = {
      action: 'create',
      after: {
        email: 'user@example.com',
        name: 'Ivan Horvat',
        content: 'Povjerljiv sadržaj',
        title: 'Nova objava',
      },
      meta: {
        reporterEmail: 'reporter@example.com',
        tags: ['javna', 'objava'],
      },
    };

    const result = sanitizeAuditChanges(input) as Record<string, unknown>;
    const after = result.after as Record<string, unknown>;
    const meta = result.meta as Record<string, unknown>;

    expect(after.title).toBe('Nova objava');
    expect(after.email).toEqual({
      redacted: true,
      hash: hashValue('user@example.com'),
      length: 'user@example.com'.length,
    });
    expect(after.name).toEqual({
      redacted: true,
      hash: hashValue('Ivan Horvat'),
      length: 'Ivan Horvat'.length,
    });
    expect(after.content).toEqual({
      redacted: true,
      hash: hashValue('Povjerljiv sadržaj'),
      length: 'Povjerljiv sadržaj'.length,
    });
    expect(meta.reporterEmail).toEqual({
      redacted: true,
      hash: hashValue('reporter@example.com'),
      length: 'reporter@example.com'.length,
    });
    expect(meta.tags).toEqual(['javna', 'objava']);
  });
});
