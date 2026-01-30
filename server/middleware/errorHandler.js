class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    error.statusCode = 400;
    error.message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    error.statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join('. ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired. Please log in again.';
  }

  // Joi validation error
  if (err.isJoi) {
    error.statusCode = 400;
    error.message = err.details.map((d) => d.message).join('. ');
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, res, next) => {
  const error = new ApiError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFound,
};
