const {
  securityHeaders,
  rateLimiter,
  csrfProtection,
  generateCsrfToken
} = require('../../middleware/security');

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-csrf-token-123456789abcdef')
  })
}));

describe('Security Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      ip: '192.168.1.1',
      connection: { remoteAddress: '192.168.1.1' },
      method: 'GET',
      body: {},
      headers: {},
      session: {}
    };
    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      locals: {}
    };
    next = jest.fn();
    
    jest.clearAllMocks();
    
    // Clear the loginAttempts Map between tests
    const security = require('../../middleware/security');
    if (security.loginAttempts) {
      security.loginAttempts.clear();
    }
  });

  describe('securityHeaders', () => {
    test('should set all security headers correctly', () => {
      securityHeaders(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(next).toHaveBeenCalled();
    });

    test('should set Content Security Policy header', () => {
      securityHeaders(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.quilljs.com https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.quilljs.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self'; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self';"
      );
    });

    test('should call next after setting headers', () => {
      securityHeaders(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('should work with different request/response objects', () => {
      const customReq = { custom: 'property' };
      const customRes = { setHeader: jest.fn() };
      const customNext = jest.fn();

      securityHeaders(customReq, customRes, customNext);

      expect(customRes.setHeader).toHaveBeenCalled();
      expect(customNext).toHaveBeenCalled();
    });
  });

  describe('rateLimiter', () => {
    let limiter;

    beforeEach(() => {
      // Reset Date.now to a fixed time for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should allow first request from new IP', () => {
      limiter = rateLimiter(5, 15 * 60 * 1000);
      
      limiter(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow requests within rate limit', () => {
      limiter = rateLimiter(5, 15 * 60 * 1000);
      
      // Make 4 requests
      for (let i = 0; i < 4; i++) {
        limiter(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(4);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should block requests exceeding rate limit', () => {
      limiter = rateLimiter(3, 15 * 60 * 1000); // Max 3 attempts
      
      // Make 3 allowed requests
      for (let i = 0; i < 3; i++) {
        limiter(req, res, next);
      }
      
      jest.clearAllMocks();
      
      // 4th request should be blocked
      limiter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Too Many Attempts',
        status: 429,
        message: 'Too many login attempts. Please try again later.',
        error: {},
        user: null
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reset attempts after time window expires', () => {
      limiter = rateLimiter(2, 15 * 60 * 1000); // Max 2 attempts, 15 min window
      
      // Make 2 requests
      limiter(req, res, next);
      limiter(req, res, next);
      
      // Advance time past the window
      jest.advanceTimersByTime(16 * 60 * 1000); // 16 minutes
      
      jest.clearAllMocks();
      
      // Should allow request again
      limiter(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should use different counters for different IPs', () => {
      limiter = rateLimiter(2, 15 * 60 * 1000);
      
      // First IP makes 2 requests
      req.ip = '192.168.1.1';
      limiter(req, res, next);
      limiter(req, res, next);
      
      jest.clearAllMocks();
      
      // Second IP should be allowed
      req.ip = '192.168.1.2';
      limiter(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should use connection.remoteAddress as fallback for IP', () => {
      limiter = rateLimiter(2, 15 * 60 * 1000);
      
      req.ip = undefined;
      req.connection.remoteAddress = '10.0.0.1';
      
      limiter(req, res, next);
      limiter(req, res, next);
      
      jest.clearAllMocks();
      
      // Third request should be blocked
      limiter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    test('should use default values for maxAttempts and windowMs', () => {
      limiter = rateLimiter(); // Use defaults: 5 attempts, 15 min window
      
      // Make 5 requests (should all pass)
      for (let i = 0; i < 5; i++) {
        limiter(req, res, next);
      }
      
      jest.clearAllMocks();
      
      // 6th request should be blocked
      limiter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    test('should handle custom maxAttempts and windowMs', () => {
      limiter = rateLimiter(1, 5 * 60 * 1000); // Max 1 attempt, 5 min window
      
      limiter(req, res, next);
      
      jest.clearAllMocks();
      
      // Second request should be blocked
      limiter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        message: 'Too many login attempts. Please try again later.'
      }));
    });
  });

  describe('csrfProtection', () => {
    test('should allow GET requests without CSRF check', () => {
      req.method = 'GET';

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow HEAD requests without CSRF check', () => {
      req.method = 'HEAD';

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow OPTIONS requests without CSRF check', () => {
      req.method = 'OPTIONS';

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should block POST request without CSRF token', () => {
      req.method = 'POST';
      req.body = {};
      req.session = {};

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Forbidden',
        status: 403,
        message: 'Invalid security token. Please refresh the page and try again.',
        error: {},
        user: null
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should block POST request with invalid CSRF token', () => {
      req.method = 'POST';
      req.body = { _csrf: 'invalid-token' };
      req.session = { csrfToken: 'valid-token' };

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        message: 'Invalid security token. Please refresh the page and try again.'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('should allow POST request with valid CSRF token in body', () => {
      req.method = 'POST';
      req.body = { _csrf: 'valid-token' };
      req.session = { csrfToken: 'valid-token' };

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow POST request with valid CSRF token in header', () => {
      req.method = 'POST';
      req.headers = { 'x-csrf-token': 'valid-token' };
      req.session = { csrfToken: 'valid-token' };

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should prioritize body token over header token', () => {
      req.method = 'POST';
      req.body = { _csrf: 'body-token' };
      req.headers = { 'x-csrf-token': 'header-token' };
      req.session = { csrfToken: 'body-token' };

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle missing session', () => {
      req.method = 'POST';
      req.body = { _csrf: 'some-token' };
      req.session = undefined;

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should include user information in error response when authenticated', () => {
      const mockUser = { id: 1, name: 'John Doe' };
      req.method = 'POST';
      req.body = {};
      req.session = {};
      req.user = mockUser;

      csrfProtection(req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        user: mockUser
      }));
    });

    test('should work with PUT requests', () => {
      req.method = 'PUT';
      req.body = { _csrf: 'valid-token' };
      req.session = { csrfToken: 'valid-token' };

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should work with DELETE requests', () => {
      req.method = 'DELETE';
      req.headers = { 'x-csrf-token': 'valid-token' };
      req.session = { csrfToken: 'valid-token' };

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('generateCsrfToken', () => {
    test('should generate new CSRF token when session has none', () => {
      req.session = {};

      generateCsrfToken(req, res, next);

      expect(req.session.csrfToken).toBe('mock-csrf-token-123456789abcdef');
      expect(res.locals.csrfToken).toBe('mock-csrf-token-123456789abcdef');
      expect(next).toHaveBeenCalled();
    });

    test('should not overwrite existing CSRF token', () => {
      req.session = { csrfToken: 'existing-token' };

      generateCsrfToken(req, res, next);

      expect(req.session.csrfToken).toBe('existing-token');
      expect(res.locals.csrfToken).toBe('existing-token');
      expect(next).toHaveBeenCalled();
    });

    test('should handle undefined session', () => {
      req.session = undefined;

      generateCsrfToken(req, res, next);

      expect(res.locals.csrfToken).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test('should handle null session', () => {
      req.session = null;

      generateCsrfToken(req, res, next);

      expect(res.locals.csrfToken).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    test('should always call next', () => {
      req.session = { existingData: 'test' };

      generateCsrfToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('should preserve existing session data', () => {
      req.session = { 
        userId: 123,
        loginTime: '2024-01-01T10:00:00Z',
        preferences: { theme: 'dark' }
      };

      generateCsrfToken(req, res, next);

      expect(req.session.userId).toBe(123);
      expect(req.session.loginTime).toBe('2024-01-01T10:00:00Z');
      expect(req.session.preferences).toEqual({ theme: 'dark' });
      expect(req.session.csrfToken).toBe('mock-csrf-token-123456789abcdef');
    });
  });

  describe('integration scenarios', () => {
    test('should work together - generateCsrfToken then csrfProtection', () => {
      // First generate CSRF token
      req.session = {};
      generateCsrfToken(req, res, next);
      
      const generatedToken = req.session.csrfToken;
      expect(generatedToken).toBeDefined();
      
      jest.clearAllMocks();
      
      // Then protect with CSRF
      req.method = 'POST';
      req.body = { _csrf: generatedToken };
      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle rate limiting with security headers', () => {
      const limiter = rateLimiter(1, 15 * 60 * 1000);
      
      // First request - should set headers and pass
      securityHeaders(req, res, next);
      expect(res.setHeader).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      // First rate limited request - should pass
      limiter(req, res, next);
      expect(next).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      // Second rate limited request - should be blocked
      limiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
    });

    test('should handle complex security flow', () => {
      // 1. Set security headers
      securityHeaders(req, res, next);
      expect(res.setHeader).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      // 2. Generate CSRF token
      req.session = {};
      generateCsrfToken(req, res, next);
      const token = req.session.csrfToken;
      
      jest.clearAllMocks();
      
      // 3. Check rate limiting
      const limiter = rateLimiter();
      limiter(req, res, next);
      expect(next).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      // 4. Validate CSRF for POST request
      req.method = 'POST';
      req.body = { _csrf: token, data: 'test' };
      csrfProtection(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should handle security failures gracefully', () => {
      // Generate token
      req.session = {};
      generateCsrfToken(req, res, next);
      
      jest.clearAllMocks();
      
      // Try to use wrong token
      req.method = 'POST';
      req.body = { _csrf: 'wrong-token' };
      csrfProtection(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        status: 403,
        title: 'Forbidden'
      }));
    });
  });
});