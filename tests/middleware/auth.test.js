const { authMiddleware, guestOnly } = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');
jest.mock('../../utils/auth');

const mockGenerateToken = jest.fn();
jest.doMock('../../utils/auth', () => ({
  generateToken: mockGenerateToken
}));

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      session: {},
      method: 'GET',
      originalUrl: '/dashboard'
    };
    res = {
      redirect: jest.fn(),
      clearCookie: jest.fn(),
      cookie: jest.fn(),
      locals: {}
    };
    next = jest.fn();
    
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'development';
  });

  describe('authMiddleware', () => {
    test('should redirect to login when no token is provided', async () => {
      req.cookies.token = undefined;

      await authMiddleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(req.session.returnTo).toBe('/dashboard');
      expect(next).not.toHaveBeenCalled();
    });

    test('should not set returnTo for auth routes', async () => {
      req.cookies.token = undefined;
      req.originalUrl = '/auth/login';

      await authMiddleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(req.session.returnTo).toBeUndefined();
    });

    test('should not set returnTo for POST requests', async () => {
      req.cookies.token = undefined;
      req.method = 'POST';
      req.originalUrl = '/entries';

      await authMiddleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(req.session.returnTo).toBeUndefined();
    });

    test('should successfully authenticate with valid token and user', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      const mockDecoded = { userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 };

      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);

      await authMiddleware(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(req.user).toEqual(mockUser);
      expect(res.locals.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    test('should redirect to login when token is invalid', async () => {
      req.cookies.token = 'invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(req.session.returnTo).toBe('/dashboard');
      expect(next).not.toHaveBeenCalled();
    });

    test('should redirect to login when user does not exist', async () => {
      const mockDecoded = { userId: 999, exp: Math.floor(Date.now() / 1000) + 3600 };

      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(null);

      await authMiddleware(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(999);
      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(next).not.toHaveBeenCalled();
    });

    test('should refresh token when it is close to expiring', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const now = Math.floor(Date.now() / 1000);
      const mockDecoded = { userId: 1, exp: now + (23 * 60 * 60) }; // 23 hours from now
      const newToken = 'new-refreshed-token';

      req.cookies.token = 'expiring-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);
      
      // Mock the require call for generateToken
      const authUtils = require('../../utils/auth');
      authUtils.generateToken = jest.fn().mockReturnValue(newToken);

      await authMiddleware(req, res, next);

      expect(authUtils.generateToken).toHaveBeenCalledWith(1);
      expect(res.cookie).toHaveBeenCalledWith('token', newToken, {
        httpOnly: true,
        secure: false, // development environment
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should set secure cookie in production environment', async () => {
      process.env.NODE_ENV = 'production';
      
      const mockUser = { id: 1, email: 'test@example.com' };
      const now = Math.floor(Date.now() / 1000);
      const mockDecoded = { userId: 1, exp: now + (23 * 60 * 60) };
      const newToken = 'new-refreshed-token';

      req.cookies.token = 'expiring-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);
      
      const authUtils = require('../../utils/auth');
      authUtils.generateToken = jest.fn().mockReturnValue(newToken);

      await authMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith('token', newToken, {
        httpOnly: true,
        secure: true, // production environment
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    });

    test('should not refresh token when it is not close to expiring', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const now = Math.floor(Date.now() / 1000);
      const mockDecoded = { userId: 1, exp: now + (48 * 60 * 60) }; // 48 hours from now

      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);

      await authMiddleware(req, res, next);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      const mockDecoded = { userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 };

      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockRejectedValue(new Error('Database error'));

      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authMiddleware(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith('Auth middleware error:', expect.any(Error));
      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(next).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle JWT expired error', async () => {
      req.cookies.token = 'expired-token';
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      await authMiddleware(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle malformed JWT error', async () => {
      req.cookies.token = 'malformed-token';
      const malformedError = new Error('Malformed token');
      malformedError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw malformedError;
      });

      await authMiddleware(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('guestOnly middleware', () => {
    test('should call next when no token is provided', () => {
      req.cookies.token = undefined;

      guestOnly(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    test('should redirect to dashboard when valid token is provided', () => {
      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue({ userId: 1 });

      guestOnly(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
      expect(next).not.toHaveBeenCalled();
    });

    test('should clear invalid token and call next', () => {
      req.cookies.token = 'invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      guestOnly(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    test('should handle expired token gracefully', () => {
      req.cookies.token = 'expired-token';
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      guestOnly(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    test('should handle malformed token gracefully', () => {
      req.cookies.token = 'malformed-token';
      const malformedError = new Error('Malformed token');
      malformedError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw malformedError;
      });

      guestOnly(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    test('should handle empty token string', () => {
      req.cookies.token = '';

      guestOnly(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    test('should handle null token', () => {
      req.cookies.token = null;

      guestOnly(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    test('should work with session management in authMiddleware', async () => {
      req.cookies.token = undefined;
      req.session = {}; // Start with empty session
      req.originalUrl = '/entries/new';

      await authMiddleware(req, res, next);

      expect(req.session.returnTo).toBe('/entries/new');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });

    test('should preserve existing session data', async () => {
      req.cookies.token = undefined;
      req.session = { 
        existingData: 'should be preserved',
        anotherField: 123
      };
      req.originalUrl = '/calendar';

      await authMiddleware(req, res, next);

      expect(req.session.returnTo).toBe('/calendar');
      expect(req.session.existingData).toBe('should be preserved');
      expect(req.session.anotherField).toBe(123);
    });

    test('should handle undefined session gracefully', async () => {
      req.cookies.token = undefined;
      req.session = undefined;
      req.originalUrl = '/dashboard';

      await authMiddleware(req, res, next);

      expect(req.session.returnTo).toBe('/dashboard');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });

    test('should work correctly when switching from guest to authenticated user', async () => {
      // First, test as guest
      req.cookies.token = undefined;
      guestOnly(req, res, next);
      expect(next).toHaveBeenCalled();
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Then, test with valid token
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockDecoded = { userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      
      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);

      await authMiddleware(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(res.locals.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });
});