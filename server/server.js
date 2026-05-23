require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const corsMiddleware = require('./middleware/cors');
const connectDB = require('./config/db');

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
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  if (dbState !== 1) {
    return res.status(503).json({
      status: 'error',
      db: dbStatus,
      message: 'Database is not connected',
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

  connectDB().catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    console.error('API is up but auth/data routes will return 503 until MONGO_URI is fixed.');
  });
});
