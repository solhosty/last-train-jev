import type { RequestHandler } from 'express';

interface Counter {
  count: number;
  resetsAt: number;
}

/** Bounded, process-local limits for a single-instance demo, not distributed billing control. */
export class WindowLimiter {
  private readonly counters = new Map<string, Counter>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maximumKeys = 10_000,
  ) {}

  consume(key: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
    let counter = this.counters.get(key);
    if (!counter || counter.resetsAt <= now) {
      if (this.counters.size >= this.maximumKeys) {
        for (const [candidate, value] of this.counters) {
          if (value.resetsAt <= now) this.counters.delete(candidate);
        }
        if (!this.counters.has(key) && this.counters.size >= this.maximumKeys) {
          return { allowed: false, retryAfter: Math.ceil(this.windowMs / 1000) };
        }
      }
      counter = { count: 0, resetsAt: now + this.windowMs };
      this.counters.set(key, counter);
    }
    const retryAfter = Math.max(1, Math.ceil((counter.resetsAt - now) / 1000));
    if (counter.count >= this.limit) return { allowed: false, retryAfter };
    counter.count += 1;
    return { allowed: true, retryAfter };
  }
}

export function rateLimit(
  limiter: WindowLimiter,
  scope: 'client' | 'global' = 'client',
): RequestHandler {
  return (req, res, next) => {
    const result = limiter.consume(scope === 'global' ? 'all' : (req.ip ?? 'unknown'));
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      res
        .status(429)
        .json({ error: 'The demo has reached its request limit. Please try again later.' });
      return;
    }
    next();
  };
}
