const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexFile = path.join(distDir, 'index.html');
const fallbackFile = path.join(distDir, '404.html');

if (!fs.existsSync(indexFile)) {
  console.error('spa-fallback: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

fs.copyFileSync(indexFile, fallbackFile);
console.log('spa-fallback: copied index.html to 404.html for client-side routing');
