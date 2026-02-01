import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

export function getEmailLogFields(email?: string | null): { emailHash?: string; emailDomain?: string } {
  if (!email) {
    return {};
  }

  const [localPart, domain] = email.split('@');
  const hash = createHash('sha256').update(email).digest('hex').slice(0, 12);

  if (!localPart || !domain) {
    return { emailHash: hash };
  }

  return { emailHash: hash, emailDomain: domain.toLowerCase() };
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
