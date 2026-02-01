import { hashValue } from '@/lib/pii';

const SENSITIVE_KEYS = new Set([
  'email',
  'name',
  'reporterEmail',
  'reporterName',
  'reporterPhone',
  'message',
  'description',
  'content',
  'excerpt',
  'location',
  'ipAddress',
  'userAgent',
  'confirmationToken',
  'token',
  'refreshToken',
  'accessToken',
  'idToken',
  'password',
  'secret',
  'backupCodes',
  'endpoint',
  'p256dh',
  'auth',
  'publicKey',
  'credentialID',
  'images',
]);

function redactValue(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    return {
      redacted: true,
      hash: hashValue(value),
      length: value.length,
    };
  }

  if (Array.isArray(value)) {
    return {
      redacted: true,
      length: value.length,
    };
  }

  return {
    redacted: true,
  };
}

export function sanitizeAuditChanges(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeAuditChanges(entry));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (SENSITIVE_KEYS.has(key)) {
          return [key, redactValue(entry)];
        }

        return [key, sanitizeAuditChanges(entry)];
      })
    );
  }

  return value;
}
