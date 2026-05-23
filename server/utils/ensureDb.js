const { waitForDb, getDbStatus } = require('../config/db');

const getDbHint = () => {
  const { configured, lastError } = getDbStatus();

  if (!configured) {
    return 'Set MONGO_URI in Render Dashboard → Environment (not .env.example). Use MongoDB Atlas mongodb+srv://...';
  }

  if (lastError?.includes('localhost') || lastError?.includes('127.0.0.1')) {
    return 'MONGO_URI uses localhost. Render needs MongoDB Atlas (mongodb+srv://...). Update Render Environment variables.';
  }

  if (lastError?.includes('authentication failed')) {
    return 'MongoDB password is wrong. Update MONGO_URI with the correct Atlas user password (URL-encode special characters like @ # :).';
  }

  if (lastError?.includes('ENOTFOUND') || lastError?.includes('querySrv')) {
    return 'MongoDB cluster hostname is invalid. Copy a fresh connection string from MongoDB Atlas.';
  }

  if (
    lastError?.includes('IP') ||
    lastError?.includes('whitelist') ||
    lastError?.includes('Could not connect to any servers')
  ) {
    return 'Atlas blocked the connection. Go to MongoDB Atlas → Network Access → ADD IP ADDRESS → Allow Access from Anywhere (0.0.0.0/0) → Confirm. Wait 2 minutes, then retry.';
  }

  if (lastError?.includes('authentication failed') || lastError?.includes('bad auth')) {
    return 'Wrong Atlas username or password. Reset password in Atlas → Database Access, then update MONGO_URI on Render.';
  }

  if (lastError?.includes('querySrv') || lastError?.includes('ECONNREFUSED')) {
    return 'DNS/network blocked Atlas. In Atlas → Network Access allow 0.0.0.0/0. Ensure cluster is not paused.';
  }

  if (lastError?.includes('timed out')) {
    return 'Atlas is slow to connect. Wait 1 minute and refresh. Confirm cluster is active in Atlas dashboard.';
  }

  return 'Check MONGO_URI on Render matches server/.env MONGO_URI_ATLAS. Atlas Network Access: 0.0.0.0/0.';
};

const ensureDb = async (res) => {
  const connected = await waitForDb(process.env.RENDER ? 60000 : 30000);

  if (!connected) {
    res.status(503).json({
      message: 'Database is not connected. Please try again in a moment.',
      hint: getDbHint(),
    });
    return false;
  }

  return true;
};

module.exports = { ensureDb, getDbHint };
