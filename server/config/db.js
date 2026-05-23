const dns = require('dns');
const mongoose = require('mongoose');
const { resolveMongoUri, validateMongoUriForDeploy, maskUri } = require('./env');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let lastConnectionError = null;
let connectionPromise = null;

const isRender = Boolean(process.env.RENDER);

const mongooseOptions = {
  serverSelectionTimeoutMS: isRender ? 60000 : 30000,
  connectTimeoutMS: isRender ? 60000 : 30000,
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

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  console.log(`MongoDB target (${source}): ${maskUri(uri)}`);
  lastConnectionError = null;

  connectionPromise = mongoose
    .connect(uri, mongooseOptions)
    .then((conn) => {
      console.log(`MongoDB Connected (${source}): ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      lastConnectionError = err.message;
      console.error(`MongoDB connection error: ${err.message}`);
      throw err;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
};

const connectWithRetry = async (attempt = 1) => {
  const maxAttempts = 15;

  try {
    await connectDB();
  } catch (error) {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch {
        /* ignore */
      }
    }

    if (attempt >= maxAttempts) {
      console.error('MongoDB: max connection attempts reached.');
      return;
    }

    const delay = Math.min(4000 * attempt, 30000);
    console.log(`MongoDB: retry ${attempt}/${maxAttempts} in ${delay / 1000}s...`);

    setTimeout(() => {
      connectWithRetry(attempt + 1);
    }, delay);
  }
};

const waitForDb = async (timeoutMs = isRender ? 60000 : 30000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    if (!connectionPromise && mongoose.connection.readyState !== 2) {
      try {
        await connectDB();
      } catch {
        /* logged in connectDB */
      }
    } else if (connectionPromise) {
      try {
        await connectionPromise;
      } catch {
        /* will retry loop */
      }
    }

    if (mongoose.connection.readyState === 1) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return mongoose.connection.readyState === 1;
};

const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;
  const { uri } = resolveMongoUri();

  return {
    status: states[readyState] || 'unknown',
    readyState,
    connected: readyState === 1,
    configured: Boolean(uri),
    usingAtlas: Boolean(uri && uri.includes('mongodb+srv')),
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
