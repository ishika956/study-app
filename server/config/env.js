const clean = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

const resolveMongoUri = () => {
  const candidates = [
    process.env.MONGO_URI,
    process.env.MONGODB_URI,
    process.env.DATABASE_URL,
  ]
    .map(clean)
    .filter((uri) => uri.startsWith('mongodb'));

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    throw new Error(
      'MONGO_URI is not set on the server. Add your MongoDB Atlas connection string in Render → Environment.'
    );
  }

  return 'mongodb://127.0.0.1:27017/studyapp';
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

module.exports = { resolveMongoUri, resolveJwtSecret, clean };
