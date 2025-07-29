const { errorHandler, notFoundHandler } = require('../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      xhr: false,
      headers: { accept: 'text/html' },
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      render: jest.fn()
    };
    next = jest.fn();
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation();
    
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('errorHandler', () => {
    test('should handle generic error with default values', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith('Error:', error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Server Error',
        status: 500,
        message: 'We apologize for the inconvenience. Please try again later.',
        error: error,
        user: null
      });
    });

    test('should handle error with custom status and message', () => {
      const error = new Error('Custom error message');
      error.status = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Error',
        status: 400,
        message: 'Custom error message',
        error: error,
        user: null
      });
    });

    test('should handle ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Validation Error',
        status: 400,
        message: 'Please check your input and try again.',
        error: error,
        user: null
      });
    });

    test('should handle UnauthorizedError', () => {
      const error = new Error('Unauthorized access');
      error.name = 'UnauthorizedError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Authentication Error',
        status: 401,
        message: 'Please log in to continue.',
        error: error,
        user: null
      });
    });

    test('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Authentication Error',
        status: 401,
        message: 'Please log in to continue.',
        error: error,
        user: null
      });
    });

    test('should handle SQLITE_CONSTRAINT error with UNIQUE constraint', () => {
      const error = new Error('UNIQUE constraint failed: users.email');
      error.code = 'SQLITE_CONSTRAINT';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Database Error',
        status: 400,
        message: 'This record already exists.',
        error: error,
        user: null
      });
    });

    test('should handle SQLITE_CONSTRAINT error without UNIQUE constraint', () => {
      const error = new Error('NOT NULL constraint failed');
      error.code = 'SQLITE_CONSTRAINT';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Database Error',
        status: 400,
        message: 'Unable to save data. Please check your input.',
        error: error,
        user: null
      });
    });

    test('should handle 404 error with custom message', () => {
      const error = new Error('Page not found');
      error.status = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Page Not Found',
        status: 404,
        message: 'Page not found',
        error: error,
        user: null
      });
    });

    test('should handle 404 error with default message', () => {
      const error = new Error();
      error.status = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Page Not Found',
        status: 404,
        message: 'The page you are looking for does not exist.',
        error: error,
        user: null
      });
    });

    test('should include user information when user is authenticated', () => {
      const error = new Error('Test error');
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      req.user = mockUser;

      errorHandler(error, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Server Error',
        status: 500,
        message: 'We apologize for the inconvenience. Please try again later.',
        error: error,
        user: mockUser
      });
    });

    test('should handle AJAX request with JSON response', () => {
      const error = new Error('AJAX error');
      error.status = 400;
      req.xhr = true;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          status: 400,
          message: 'AJAX error',
          stack: error.stack
        }
      });
      expect(res.render).not.toHaveBeenCalled();
    });

    test('should handle request accepting JSON with JSON response', () => {
      const error = new Error('JSON error');
      error.status = 422;
      req.headers.accept = 'application/json';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          status: 422,
          message: 'JSON error',
          stack: error.stack
        }
      });
      expect(res.render).not.toHaveBeenCalled();
    });

    test('should handle mixed accept header with JSON', () => {
      const error = new Error('Mixed accept error');
      req.headers.accept = 'text/html,application/json,*/*';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          status: 500,
          message: 'We apologize for the inconvenience. Please try again later.',
          stack: error.stack
        }
      });
      expect(res.render).not.toHaveBeenCalled();
    });

    test('should exclude stack trace in production environment', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Production error');
      req.xhr = true;

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: {
          status: 500,
          message: 'We apologize for the inconvenience. Please try again later.'
        }
      });
    });

    test('should include empty error object in production for render', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Production error');

      errorHandler(error, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Server Error',
        status: 500,
        message: 'We apologize for the inconvenience. Please try again later.',
        error: {},
        user: null
      });
    });

    test('should handle error without message', () => {
      const error = new Error();
      delete error.message;

      errorHandler(error, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Server Error',
        status: 500,
        message: 'We apologize for the inconvenience. Please try again later.',
        error: error,
        user: null
      });
    });

    test('should handle error without stack trace', () => {
      const error = new Error('No stack error');
      delete error.stack;

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith('Error:', undefined);
      expect(res.render).toHaveBeenCalledWith('error', expect.any(Object));
    });

    test('should handle different server error status codes', () => {
      const error = new Error('Server error');
      error.status = 503;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Server Error',
        status: 503,
        message: 'We apologize for the inconvenience. Please try again later.',
        error: error,
        user: null
      });
    });

    test('should handle status codes below 500 with original message', () => {
      const error = new Error('Client error');
      error.status = 403;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Error',
        status: 403,
        message: 'Client error',
        error: error,
        user: null
      });
    });

    test('should handle undefined headers gracefully', () => {
      const error = new Error('Headers test');
      req.headers = undefined;

      errorHandler(error, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        status: 500,
        message: 'We apologize for the inconvenience. Please try again later.'
      }));
    });

    test('should handle null headers gracefully', () => {
      const error = new Error('Headers test');
      req.headers = null;

      errorHandler(error, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        status: 500,
        message: 'We apologize for the inconvenience. Please try again later.'
      }));
    });
  });

  describe('notFoundHandler', () => {
    test('should create 404 error and call next', () => {
      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Page not found',
        status: 404
      }));
    });

    test('should create Error instance', () => {
      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should work with different request objects', () => {
      const customReq = { url: '/nonexistent', method: 'GET' };
      
      notFoundHandler(customReq, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Page not found',
        status: 404
      }));
    });
  });

  describe('integration scenarios', () => {
    test('should work together - notFoundHandler creates error, errorHandler processes it', () => {
      // First, notFoundHandler creates the error
      notFoundHandler(req, res, next);

      // Get the error that was passed to next
      const error = next.mock.calls[0][0];
      expect(error.status).toBe(404);
      expect(error.message).toBe('Page not found');

      // Reset mocks
      jest.clearAllMocks();

      // Now errorHandler processes the error
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error', {
        title: 'Page Not Found',
        status: 404,
        message: 'Page not found',
        error: error,
        user: null
      });
    });

    test('should handle complex error scenarios', () => {
      // Simulate a database error with additional properties
      const error = new Error('Connection timeout');
      error.code = 'SQLITE_BUSY';
      error.errno = 5;
      error.sql = 'SELECT * FROM users WHERE id = ?';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        title: 'Server Error',
        status: 500,
        error: error
      }));
    });

    test('should preserve custom error properties', () => {
      const error = new Error('Custom error');
      error.status = 422;
      error.customProperty = 'custom value';
      error.details = { field: 'email', reason: 'invalid format' };

      errorHandler(error, req, res, next);

      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        error: expect.objectContaining({
          customProperty: 'custom value',
          details: { field: 'email', reason: 'invalid format' }
        })
      }));
    });
  });
});