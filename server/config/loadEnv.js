const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const rootEnv = path.join(__dirname, '..', '..', '.env');
const serverEnv = path.join(__dirname, '..', '.env');

const isLocalUri = (uri) =>
  /mongodb(\+srv)?:\/\/(127\.0\.0\.1|localhost)/i.test(uri);

const pickBestMongoUri = () => {
  const keys = [
    'MONGO_URI_ATLAS',
    'MONGO_URI',
    'MONGODB_URI',
    'MONGODB_URL',
    'MONGO_URL',
    'DATABASE_URL',
    'ATLAS_URI',
  ];

  const candidates = [];

  for (const key of keys) {
    const uri = (process.env[key] || '').trim().replace(/^['"]|['"]$/g, '');
    if (uri.startsWith('mongodb')) {
      candidates.push({ uri, source: key });
    }
  }

  if (candidates.length === 0) return null;

  const atlas = candidates.find((c) => c.uri.includes('mongodb+srv'));
  if (atlas) return atlas;

  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    const remote = candidates.find((c) => !isLocalUri(c.uri));
    if (remote) return remote;
    return null;
  }

  const local = candidates.find((c) => isLocalUri(c.uri));
  return local || candidates[0];
};

// Bug #2 fix: load root first, then server/.env OVERRIDES (server wins)
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}
if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv, override: true });
}

// Render/Vercel dashboard vars are already in process.env — never overwrite with empty file values
const best = pickBestMongoUri();
if (best) {
  process.env.MONGO_URI = best.uri;
}

module.exports = { rootEnv, serverEnv, pickBestMongoUri };
