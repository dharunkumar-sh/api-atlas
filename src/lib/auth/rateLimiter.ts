interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const attemptsMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Clean up old expired rate limit records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptsMap.entries()) {
    if (now - record.firstAttemptAt > WINDOW_MS && (!record.lockedUntil || now > record.lockedUntil)) {
      attemptsMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check if the given identifier (e.g. IP + email) has exceeded rate limits
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = attemptsMap.get(identifier);

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS, resetSeconds: Math.ceil(WINDOW_MS / 1000) };
  }

  // Check if locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const resetSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, resetSeconds };
  }

  // Reset window if expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    attemptsMap.delete(identifier);
    return { allowed: true, remaining: MAX_ATTEMPTS, resetSeconds: Math.ceil(WINDOW_MS / 1000) };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  const resetSeconds = Math.ceil((record.firstAttemptAt + WINDOW_MS - now) / 1000);

  return { allowed: remaining > 0, remaining, resetSeconds };
}

/**
 * Record a failed attempt
 */
export function recordFailedAttempt(identifier: string): RateLimitResult {
  const now = Date.now();
  let record = attemptsMap.get(identifier);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    record = { attempts: 1, firstAttemptAt: now };
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }

  attemptsMap.set(identifier, record);
  return checkRateLimit(identifier);
}

/**
 * Reset rate limit upon successful authentication
 */
export function resetRateLimit(identifier: string): void {
  attemptsMap.delete(identifier);
}
