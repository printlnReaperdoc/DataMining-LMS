// Entry point for npm run seed
require('dotenv').config();
const { runSeed } = require('./database/seed');

runSeed()
  .then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed execution error:', err);
    process.exit(1);
  });
