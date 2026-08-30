const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const { Pool } = require(\'pg\')')) {
  throw new Error('PostgreSQL dependency not wired into server.js');
}

console.log('Backend dependency check passed');
