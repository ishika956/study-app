const clean = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

const MONGO_ENV_KEYS = [
  'MONGO_URI',
  'MONGODB_URI',
  'MONGODB_URL',
  'MONGO_URL',
  'DATABASE_URL',
  'ATLAS_URI',
];

const resolveMongoUri = () => {
  for (const key of MONGO_ENV_KEYS) {
    const uri = clean(process.env[key]);
    if (uri.startsWith('mongodb')) {
      return { uri, source: key };
    }
  }

  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    return {
      uri: null,
      source: null,
      error:
        'MONGO_URI is not set on Render. Go to Render → your service → Environment → add MONGO_URI with your MongoDB Atlas connection string.',
    };
  }

  return { uri: 'mongodb://127.0.0.1:27017/studyapp', source: 'default' };
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
  clean,
};
