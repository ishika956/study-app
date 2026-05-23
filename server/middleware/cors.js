const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://study-app-liart.vercel.app',
];

const buildAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return [...new Set([...defaultOrigins, ...fromEnv])];
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const allowed = buildAllowedOrigins();
  if (allowed.includes(origin)) return true;

  // Any Vercel deployment (production + preview URLs)
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) {
    return true;
  }

  return false;
};

/**
 * Manual CORS so preflight OPTIONS always gets headers (even when DB is down).
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

module.exports = corsMiddleware;
