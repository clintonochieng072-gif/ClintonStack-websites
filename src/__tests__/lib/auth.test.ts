import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock process.env
vi.stubEnv('JWT_SECRET', 'test-secret');

// Mock dependencies
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/models/User', () => ({
  default: {
    findById: vi.fn(),
  },
}));

const mockJwtVerify = vi.mocked((await import('jsonwebtoken')).default.verify) as any;
const mockCookies = vi.mocked((await import('next/headers')).cookies) as any;
const mockDbConnect = vi.mocked((await import('@/lib/mongodb')).default) as any;
const mockUserFindById = vi.mocked((await import('@/lib/models/User')).default.findById) as any;

// Import after mocks
import { getUserFromToken } from '@/lib/auth';

describe('getUserFromToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should return null if no token in cookies', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);

    const result = await getUserFromToken();

    expect(result).toBeNull();
    expect(mockCookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith('token');
  });

  it('should return null if token is invalid', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);
    mockJwtVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const result = await getUserFromToken();

    expect(result).toBeNull();
    expect(mockJwtVerify).toHaveBeenCalledWith('invalid-token', undefined);
  });

  it('should return null if user not found', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);
    mockJwtVerify.mockReturnValue({ userId: 'user-id' });
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    };
    mockUserFindById.mockReturnValue(mockQuery as any);

    const result = await getUserFromToken();

    expect(result).toBeNull();
    expect(mockDbConnect).toHaveBeenCalled();
    expect(mockUserFindById).toHaveBeenCalledWith('user-id');
  });

  it('should return null if user status is not active', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);
    mockJwtVerify.mockReturnValue({ userId: 'user-id' });
    const mockUserData = {
      _id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      status: 'inactive',
    };
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockUserData),
    };
    mockUserFindById.mockReturnValue(mockQuery as any);

    const result = await getUserFromToken();

    expect(result).toBeNull();
  });

  it('should return user data if token is valid and user is active', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);
    mockJwtVerify.mockReturnValue({ userId: 'user-id' });
    const mockUserData = {
      _id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      plan: 'free',
      status: 'active',
      customDomain: null,
      createdAt: new Date(),
      has_paid: false,
      is_first_login: true,
      isLocked: false,
      category: 'developer',
      niche: 'web',
      template: 'default',
      onboarded: true,
      avatarUrl: 'avatar.jpg',
      trialEndsAt: new Date(),
    };
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockUserData),
    };
    mockUserFindById.mockReturnValue(mockQuery as any);

    const result = await getUserFromToken();

    expect(result).toEqual({
      id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      plan: 'free',
      status: 'active',
      customDomain: null,
      createdAt: mockUserData.createdAt,
      has_paid: false,
      is_first_login: true,
      isLocked: false,
      category: 'developer',
      niche: 'web',
      template: 'default',
      onboarded: true,
      avatarUrl: 'avatar.jpg',
      trialEndsAt: mockUserData.trialEndsAt,
    });
  });
});