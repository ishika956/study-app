const path = require('path');
const dotenv = require('dotenv');

// Load root .env first, then server/.env (server overrides)
const rootEnv = path.join(__dirname, '..', '..', '.env');
const serverEnv = path.join(__dirname, '..', '.env');

dotenv.config({ path: rootEnv });
dotenv.config({ path: serverEnv });

module.exports = { rootEnv, serverEnv };
