import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authRateLimiter, getClientIP } from '@/lib/rateLimiter';

describe('RateLimiter logic via authRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow attempts within limit', () => {
    const ip = '192.168.1.1';

    expect(authRateLimiter.check(ip)).toBe(true);
    expect(authRateLimiter.check(ip)).toBe(true);
    expect(authRateLimiter.check(ip)).toBe(true);
    expect(authRateLimiter.check(ip)).toBe(true);
    expect(authRateLimiter.check(ip)).toBe(true);
  });

  it('should block attempts over limit', () => {
    const ip = '192.168.1.1';

    for (let i = 0; i < 5; i++) {
      authRateLimiter.check(ip);
    }
    expect(authRateLimiter.check(ip)).toBe(false); // 6th should be blocked
  });

  it('should reset attempts after window', () => {
    const ip = '192.168.1.1';

    for (let i = 0; i < 5; i++) {
      authRateLimiter.check(ip);
    }
    expect(authRateLimiter.check(ip)).toBe(false);

    // Advance time past 15 minutes
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    expect(authRateLimiter.check(ip)).toBe(true); // Should allow again
  });

  it('should return correct remaining attempts', () => {
    const ip = '192.168.1.100';

    expect(authRateLimiter.getRemainingAttempts(ip)).toBe(5);
    authRateLimiter.check(ip);
    expect(authRateLimiter.getRemainingAttempts(ip)).toBe(4);
    authRateLimiter.check(ip);
    expect(authRateLimiter.getRemainingAttempts(ip)).toBe(3);
  });

  it('should handle multiple IPs independently', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    for (let i = 0; i < 5; i++) {
      authRateLimiter.check(ip1);
    }
    expect(authRateLimiter.check(ip1)).toBe(false); // ip1 blocked

    expect(authRateLimiter.check(ip2)).toBe(true); // ip2 still allowed
  });
});

describe('authRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have correct configuration', () => {
    // Test that it blocks after 5 attempts in 15 minutes
    const ip = '192.168.1.200';

    for (let i = 0; i < 5; i++) {
      expect(authRateLimiter.check(ip)).toBe(true);
    }
    expect(authRateLimiter.check(ip)).toBe(false);
  });
});

describe('getClientIP', () => {
  it('should return x-forwarded-for header', () => {
    const mockRequest = {
      headers: {
        get: vi.fn().mockReturnValue('203.0.113.1, 198.51.100.1'),
      },
    };

    expect(getClientIP(mockRequest as any)).toBe('203.0.113.1');
  });

  it('should return first x-forwarded-for when multiple', () => {
    const mockRequest = {
      headers: {
        get: vi.fn().mockReturnValue('203.0.113.1, 198.51.100.1'),
      },
    };

    expect(getClientIP(mockRequest as any)).toBe('203.0.113.1');
  });

  it('should return request.ip if no x-forwarded-for', () => {
    const mockRequest = {
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
      ip: '192.168.1.1',
    };

    expect(getClientIP(mockRequest as any)).toBe('192.168.1.1');
  });

  it('should return unknown if no IP found', () => {
    const mockRequest = {
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
      ip: undefined,
    };

    expect(getClientIP(mockRequest as any)).toBe('unknown');
  });
});