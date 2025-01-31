const cron = require('node-cron');
const knex = require('./mysql/knex');
const { processImportedFile } = require('./v1/dashboard/dashboard.service');

// Schedule the background task to run every 10 minutes
cron.schedule('*/1 * * * *', async () => {
  console.log('Running background task to process uploaded files...');
  await processImportedFile();
});

console.log('Background worker started...');