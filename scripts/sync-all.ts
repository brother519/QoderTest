/**
 * Full data sync from MySQL to Elasticsearch
 * Run this script to sync all data from MySQL to ES indices
 * 
 * Usage: npm run sync-all
 */

import dotenv from 'dotenv';
dotenv.config();

import { syncService } from '../src/services/elasticsearch/SyncService';
import { indexService } from '../src/services/elasticsearch/IndexService';
import { checkConnection as checkESConnection } from '../src/config/elasticsearch';
import { checkConnection as checkMySQLConnection } from '../src/config/database';

async function main() {
  console.log('=== Full Data Sync ===\n');

  // Check connections
  console.log('Checking connections...');
  
  const esConnected = await checkESConnection();
  if (!esConnected) {
    console.error('Cannot connect to Elasticsearch. Please check your configuration.');
    process.exit(1);
  }

  const mysqlConnected = await checkMySQLConnection();
  if (!mysqlConnected) {
    console.error('Cannot connect to MySQL. Please check your configuration.');
    process.exit(1);
  }

  console.log('All connections OK\n');

  // Check if indices exist
  console.log('Checking indices...');
  for (const indexName of ['articles', 'products', 'posts']) {
    const exists = await indexService.indexExists(indexName);
    if (!exists) {
      console.log(`Index ${indexName} does not exist. Run 'npm run setup-indices' first.`);
      process.exit(1);
    }
  }
  console.log('All indices exist\n');

  // Start sync
  console.log('Starting full sync...\n');
  const startTime = Date.now();
  
  const result = await syncService.syncAll();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n=== Sync Results ===');
  console.log(`Articles synced: ${result.articles}`);
  console.log(`Products synced: ${result.products}`);
  console.log(`Posts synced: ${result.posts}`);
  console.log(`Total documents: ${result.articles + result.products + result.posts}`);
  console.log(`Duration: ${duration}s`);

  console.log('\nSync completed successfully!');
  process.exit(0);
}

main().catch(error => {
  console.error('Sync failed:', error);
  process.exit(1);
});
