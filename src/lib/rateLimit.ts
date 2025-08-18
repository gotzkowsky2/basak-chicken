type Bucket = { count: number; resetAt: number };

const buckets: Map<string, Bucket> = new Map();

export function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: maxRequests - bucket.count, resetAt: bucket.resetAt };
}

export function getClientKeyFromRequestHeaders(headers: Headers) {
  const fwdFor = headers.get('x-forwarded-for') || headers.get('x-real-ip');
  const ip = fwdFor ? fwdFor.split(',')[0].trim() : 'unknown';
  const ua = headers.get('user-agent') || 'unknown';
  return `${ip}:${ua}`;
}


