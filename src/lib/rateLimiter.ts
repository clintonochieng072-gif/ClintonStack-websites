interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxAttempts: number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxAttempts = options.maxAttempts;
  }

  check(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing attempts for this IP
    let attempts = this.attempts.get(ip) || [];

    // Filter out attempts outside the window
    attempts = attempts.filter(timestamp => timestamp > windowStart);

    if (attempts.length >= this.maxAttempts) {
      // Too many attempts, rate limit
      return false;
    }

    // Add current attempt
    attempts.push(now);
    this.attempts.set(ip, attempts);

    return true;
  }

  // Optional: method to get remaining attempts
  getRemainingAttempts(ip: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const attempts = this.attempts.get(ip) || [];
    const validAttempts = attempts.filter(timestamp => timestamp > windowStart);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }
}

// Create a singleton instance for auth routes
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
});

// Helper function to get client IP from request
export function getClientIP(request: any): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}