const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err.stack);

  // Set default error status and message
  let status = err.status || 500;
  let message = err.message || 'Something went wrong!';
  let title = 'Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    title = 'Validation Error';
    message = 'Please check your input and try again.';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    status = 401;
    title = 'Authentication Error';
    message = 'Please log in to continue.';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    status = 400;
    title = 'Database Error';
    if (err.message.includes('UNIQUE')) {
      message = 'This record already exists.';
    } else {
      message = 'Unable to save data. Please check your input.';
    }
  } else if (status === 404) {
    title = 'Page Not Found';
    message = err.message || 'The page you are looking for does not exist.';
  } else if (status >= 500) {
    title = 'Server Error';
    message = 'We apologize for the inconvenience. Please try again later.';
  }

  // Handle AJAX requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(status).json({
      error: {
        status: status,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  // Render error page
  res.status(status).render('error', {
    title: title,
    status: status,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.user || null
  });
};

const notFoundHandler = (req, res, next) => {
  const err = new Error('Page not found');
  err.status = 404;
  next(err);
};

module.exports = { errorHandler, notFoundHandler };