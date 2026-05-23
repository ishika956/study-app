const clean = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

const MONGO_ENV_KEYS = [
  'MONGO_URI',
  'MONGO_URI_ATLAS',
  'MONGODB_URI',
  'MONGODB_URL',
  'MONGO_URL',
  'DATABASE_URL',
  'ATLAS_URI',
];

const maskUri = (uri) =>
  uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

const isLocalUri = (uri) =>
  /mongodb(\+srv)?:\/\/(127\.0\.0\.1|localhost)/i.test(uri);

const resolveMongoUri = () => {
  const candidates = [];

  for (const key of MONGO_ENV_KEYS) {
    const uri = clean(process.env[key]);
    if (uri.startsWith('mongodb')) {
      candidates.push({ uri, source: key });
    }
  }

  if (candidates.length > 0) {
    const atlas = candidates.find((c) => c.uri.includes('mongodb+srv'));
    if (atlas) return atlas;

    if (process.env.RENDER || process.env.NODE_ENV === 'production') {
      const remote = candidates.find((c) => !isLocalUri(c.uri));
      if (remote) return remote;
    } else {
      const local = candidates.find((c) => isLocalUri(c.uri));
      if (local) return local;
    }

    return candidates[0];
  }

  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    return {
      uri: null,
      source: null,
      error:
        'MONGO_URI is not set on Render. Go to Render Dashboard → your service → Environment → add MONGO_URI (MongoDB Atlas connection string). .env files on your PC are NOT uploaded to Render.',
    };
  }

  return { uri: 'mongodb://127.0.0.1:27017/studyapp', source: 'default' };
};

const validateMongoUriForDeploy = (uri) => {
  if (!uri) return null;

  if ((process.env.RENDER || process.env.NODE_ENV === 'production') && isLocalUri(uri)) {
    return (
      'MONGO_URI points to localhost (127.0.0.1). Render cannot use your PC database. ' +
      'Set MONGO_URI in Render Environment to a mongodb+srv://... Atlas connection string.'
    );
  }

  if (!uri.includes('mongodb.net') && isLocalUri(uri) && process.env.RENDER) {
    return 'Use MongoDB Atlas (mongodb+srv://...) in Render Environment, not localhost.';
  }

  return null;
};

const isMongoConfigured = () => {
  const { uri } = resolveMongoUri();
  return Boolean(uri);
};

const resolveJwtSecret = () => {
  const secret = clean(process.env.JWT_SECRET);

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    throw new Error(
      'JWT_SECRET is not set on the server. Add it in Render → Environment.'
    );
  }

  return 'supersecretjwtkey12345!';
};

module.exports = {
  resolveMongoUri,
  resolveJwtSecret,
  isMongoConfigured,
  validateMongoUriForDeploy,
  maskUri,
  clean,
};
