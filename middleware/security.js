// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    'default-src \'self\'; ' +
    'script-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net https://cdn.quilljs.com https://cdnjs.cloudflare.com; ' +
    'style-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net https://cdn.quilljs.com https://cdnjs.cloudflare.com; ' +
    'font-src \'self\' https://cdnjs.cloudflare.com; ' +
    'img-src \'self\' data: https:; ' +
    'connect-src \'self\'; ' +
    'frame-src \'none\'; ' +
    'object-src \'none\'; ' +
    'base-uri \'self\';'
  );

  next();
};

// Rate limiting for authentication routes
const loginAttempts = new Map();

const rateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!loginAttempts.has(ip)) {
      loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempts = loginAttempts.get(ip);

    if (now > attempts.resetTime) {
      attempts.count = 1;
      attempts.resetTime = now + windowMs;
      return next();
    }

    if (attempts.count >= maxAttempts) {
      return res.status(429).render('error', {
        title: 'Too Many Attempts',
        status: 429,
        message: 'Too many login attempts. Please try again later.',
        error: {},
        user: null
      });
    }

    attempts.count++;
    next();
  };
};

// CSRF protection for state-changing requests
const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.body._csrf || req.headers['x-csrf-token'];
  const sessionToken = req.session && req.session.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).render('error', {
      title: 'Forbidden',
      status: 403,
      message: 'Invalid security token. Please refresh the page and try again.',
      error: {},
      user: req.user || null
    });
  }

  next();
};

// Generate CSRF token
const generateCsrfToken = (req, res, next) => {
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session && req.session.csrfToken;
  next();
};

module.exports = {
  securityHeaders,
  rateLimiter,
  csrfProtection,
  generateCsrfToken
};
