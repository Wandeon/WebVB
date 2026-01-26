type RateLimitEntry = {
  timestamps: number[];
};

const rateLimits = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    for (const [key, entry] of rateLimits.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < oneHour);
      if (entry.timestamps.length === 0) {
        rateLimits.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(
  ip: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimits.get(ip) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = Math.min(...entry.timestamps);
    return { allowed: false, remaining: 0, resetAt: oldestInWindow + windowMs };
  }

  entry.timestamps.push(now);
  rateLimits.set(ip, entry);

  return { allowed: true, remaining: limit - entry.timestamps.length, resetAt: now + windowMs };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
