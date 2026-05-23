require('./config/loadEnv');

const express = require('express');
const mongoose = require('mongoose');

const corsMiddleware = require('./middleware/cors');
const { connectWithRetry, getDbStatus, waitForDb } = require('./config/db');
const { getDbHint } = require('./utils/ensureDb');

const app = express();

app.set('trust proxy', 1);

// CORS must be first — handles OPTIONS preflight before any other logic
app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

app.get('/api/health', async (req, res) => {
  const dbInfo = getDbStatus();

  if (!dbInfo.configured) {
    return res.status(503).json({
      status: 'error',
      db: 'not_configured',
      message: 'MONGO_URI is missing on the server',
      hint: getDbHint(),
    });
  }

  const connected = await waitForDb(process.env.RENDER ? 60000 : 30000);
  const after = getDbStatus();

  if (!connected) {
    return res.status(503).json({
      status: 'error',
      db: after.status,
      message: 'Database is not connected',
      hint: getDbHint(),
      error: after.lastError || undefined,
    });
  }

  try {
    await mongoose.connection.db.admin().ping();
    res.json({
      status: 'ok',
      db: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      message: 'Database ping failed',
      hint: getDbHint(),
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/targets', require('./routes/targets'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/whiteboard', require('./routes/whiteboard'));
app.use('/api/docs', require('./routes/docs'));

app.use((req, res) => {
  res.status(404).json({
    message: `API Route not found: ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately so CORS/preflight always works on Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);

  const { uri, source } = require('./config/env').resolveMongoUri();
  if (uri && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
    console.warn('-------------------------------------------------------');
    console.warn('WARNING: MONGO_URI uses localhost (127.0.0.1).');
    console.warn('This works ONLY on your PC. Render/Vercel need Atlas:');
    console.warn('mongodb+srv://USER:PASS@cluster....mongodb.net/studyapp');
    console.warn('Set that in Render Dashboard → Environment → MONGO_URI');
    console.warn('-------------------------------------------------------');
  } else if (!uri) {
    console.warn('WARNING: MONGO_URI is not set. Database will not connect.');
  } else {
    console.log(`MongoDB config loaded from ${source}`);
  }

  connectWithRetry();
});
