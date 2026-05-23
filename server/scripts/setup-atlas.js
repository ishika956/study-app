/**
 * Run once: node scripts/setup-atlas.js
 * Paste your MongoDB Atlas connection string — updates server/.env
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '..', '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n=== MongoDB Atlas setup ===\n');
console.log('1. Go to https://cloud.mongodb.com');
console.log('2. Network Access → Allow 0.0.0.0/0');
console.log('3. Database → Connect → Drivers → copy connection string');
console.log('4. Replace <password>, add /studyapp before ?\n');
console.log('Example:');
console.log(
  'mongodb+srv://user:PASS@cluster0.xxx.mongodb.net/studyapp?retryWrites=true&w=majority\n'
);

rl.question('Paste your mongodb+srv connection string: ', (uri) => {
  rl.close();

  const trimmed = uri.trim().replace(/^['"]|['"]$/g, '');

  if (!trimmed.startsWith('mongodb+srv://')) {
    console.error('\nERROR: Must start with mongodb+srv://\n');
    process.exit(1);
  }

  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  if (/^MONGO_URI_ATLAS=.*/m.test(content)) {
    content = content.replace(/^MONGO_URI_ATLAS=.*/m, `MONGO_URI_ATLAS=${trimmed}`);
  } else {
    content = `MONGO_URI_ATLAS=${trimmed}\n${content}`;
  }

  if (/^MONGO_URI=.*/m.test(content)) {
    content = content.replace(
      /^MONGO_URI=.*/m,
      'MONGO_URI=mongodb://127.0.0.1:27017/studyapp'
    );
  }

  fs.writeFileSync(envPath, content);
  console.log('\nSaved to server/.env as MONGO_URI_ATLAS');
  console.log('\nNOW copy the SAME string to Render:');
  console.log('  Render Dashboard → your service → Environment');
  console.log('  Key: MONGO_URI');
  console.log('  Value: (paste same Atlas string)');
  console.log('  Save → wait for redeploy\n');
  console.log('Test: npm run check-db\n');
});
