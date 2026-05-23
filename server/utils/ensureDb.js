const { waitForDb, getDbStatus } = require('../config/db');

const getDbHint = () => {
  const { configured, lastError } = getDbStatus();

  if (!configured) {
    return 'Set MONGO_URI in Render Environment to your MongoDB Atlas connection string.';
  }

  if (lastError?.includes('authentication failed')) {
    return 'MongoDB password is wrong. Update MONGO_URI with the correct Atlas user password (URL-encode special characters like @ # :).';
  }

  if (lastError?.includes('ENOTFOUND') || lastError?.includes('querySrv')) {
    return 'MongoDB cluster hostname is invalid. Copy a fresh connection string from MongoDB Atlas.';
  }

  if (lastError?.includes('IP') || lastError?.includes('whitelist')) {
    return 'In MongoDB Atlas → Network Access → allow 0.0.0.0/0 so Render can connect.';
  }

  return 'Check MONGO_URI on Render and MongoDB Atlas Network Access (0.0.0.0/0).';
};

const ensureDb = async (res) => {
  const connected = await waitForDb(25000);

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
