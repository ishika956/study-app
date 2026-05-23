require('../config/loadEnv');
const mongoose = require('mongoose');
const { resolveMongoUri, validateMongoUriForDeploy, maskUri } = require('../config/env');

const run = async () => {
  const { uri, source, error } = resolveMongoUri();

  console.log('\n=== Database connection check ===\n');

  if (!uri) {
    console.error('FAIL:', error);
    process.exit(1);
  }

  console.log('Loaded from:', source);
  console.log('URI:', maskUri(uri));

  const deployWarn = validateMongoUriForDeploy(uri);
  if (deployWarn) {
    console.warn('\nWARNING (Render/production):', deployWarn);
  }

  if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.log('\nNote: This is LOCAL MongoDB — works only on your PC.');
    console.log('Vercel + Render need MongoDB Atlas (mongodb+srv://...)\n');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    await mongoose.connection.db.admin().ping();
    console.log('\nSUCCESS: Connected and ping OK.\n');
    process.exit(0);
  } catch (err) {
    console.error('\nFAIL:', err.message);
    if (uri.includes('127.0.0.1')) {
      console.error('→ Start MongoDB on your PC, or switch MONGO_URI to MongoDB Atlas.');
    } else {
      console.error('→ Check Atlas password, IP whitelist (0.0.0.0/0), and connection string.');
    }
    process.exit(1);
  }
};

run();
