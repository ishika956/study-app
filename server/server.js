require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = async () => {
  const conn = require('./config/db');
  await conn();
};

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://study-app-liart.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/targets', require('./routes/targets'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/whiteboard', require('./routes/whiteboard'));
app.use('/api/docs', require('./routes/docs'));

// Test route
app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `API Route not found: ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});