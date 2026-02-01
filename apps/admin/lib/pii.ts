import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

export function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 12);
}

export function getEmailLogFields(email?: string | null): { emailHash?: string; emailDomain?: string } {
  if (!email) {
    return {};
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [localPart, domain] = normalizedEmail.split('@');
  const hash = hashValue(normalizedEmail);

  if (!localPart || !domain) {
    return { emailHash: hash };
  }

  return { emailHash: hash, emailDomain: domain.toLowerCase() };
}

export function getTextLogFields(text?: string | null): { textHash?: string; textLength?: number } {
  if (!text) {
    return {};
  }

  return {
    textHash: hashValue(text),
    textLength: text.length,
  };
}

export function anonymizeIp(ip?: string | null): string | null {
  if (!ip || ip === 'unknown') {
    return null;
  }

  if (isIP(ip) === 4) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  if (isIP(ip) === 6) {
    const segments = ip.split(':');
    const prefix = segments.slice(0, 4).join(':');
    return `${prefix}::`;
  }

  return null;
}
