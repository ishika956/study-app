require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');

const app = express();

app.set('trust proxy', 1);

const defaultClientOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://study-app-liart.vercel.app',
];

const allowedOrigins = [
  ...defaultClientOrigins,
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Vercel production + preview deployments
  if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  res.json({
    status: 'ok',
    db: dbStatus,
  });
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

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
