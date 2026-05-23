const mapAuthError = (error, fallback = 'Server error. Please try again.') => {
  if (!error) {
    return { status: 500, message: fallback };
  }

  if (error.code === 11000) {
    return { status: 400, message: 'User already exists' };
  }

  if (error.name === 'ValidationError') {
    const first = Object.values(error.errors || {})[0];
    return {
      status: 400,
      message: first?.message || 'Invalid registration data',
    };
  }

  if (
    error.name === 'MongoNetworkError' ||
    error.name === 'MongooseServerSelectionError' ||
    error.name === 'MongoTimeoutError'
  ) {
    return {
      status: 503,
      message: 'Database connection failed. Please try again in a moment.',
    };
  }

  if (error.name === 'MongoServerError') {
    if (error.code === 13 || error.code === 18) {
      return {
        status: 503,
        message:
          'Database access denied. Check MongoDB Atlas user password and permissions.',
      };
    }
  }

  return { status: 500, message: fallback };
};

module.exports = { mapAuthError };
