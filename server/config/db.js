const mongoose = require('mongoose');
const { resolveMongoUri, validateMongoUriForDeploy, maskUri } = require('./env');

let lastConnectionError = null;
let isConnecting = false;

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  autoIndex: true,
};

const connectDB = async () => {
  const { uri, source, error } = resolveMongoUri();

  if (!uri) {
    lastConnectionError = error;
    throw new Error(error);
  }

  const deployError = validateMongoUriForDeploy(uri);
  if (deployError) {
    lastConnectionError = deployError;
    throw new Error(deployError);
  }

  console.log(`MongoDB target (${source}): ${maskUri(uri)}`);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;
  lastConnectionError = null;

  try {
    const conn = await mongoose.connect(uri, mongooseOptions);
    console.log(`MongoDB Connected (${source}): ${conn.connection.host}`);
    return conn;
  } catch (err) {
    lastConnectionError = err.message;
    console.error(`MongoDB connection error: ${err.message}`);
    throw err;
  } finally {
    isConnecting = false;
  }
};

const connectWithRetry = async (attempt = 1) => {
  const maxAttempts = 12;

  try {
    await connectDB();
  } catch (error) {
    if (attempt >= maxAttempts) {
      console.error('MongoDB: max connection attempts reached.');
      return;
    }

    const delay = Math.min(5000 * attempt, 30000);
    console.log(`MongoDB: retry ${attempt}/${maxAttempts} in ${delay / 1000}s...`);

    setTimeout(() => {
      connectWithRetry(attempt + 1);
    }, delay);
  }
};

const waitForDb = async (timeoutMs = 20000) => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    await Promise.race([
      connectDB(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
      ),
    ]);
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;

  return {
    status: states[readyState] || 'unknown',
    readyState,
    connected: readyState === 1,
    configured: Boolean(resolveMongoUri().uri),
    lastError: lastConnectionError,
  };
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — will retry on next request.');
});

mongoose.connection.on('error', (err) => {
  lastConnectionError = err.message;
  console.error('MongoDB connection error event:', err.message);
});

module.exports = {
  connectDB,
  connectWithRetry,
  waitForDb,
  getDbStatus,
};
