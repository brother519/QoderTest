/**
 * Setup Elasticsearch indices
 * Run this script to initialize all ES indices with proper mappings
 * 
 * Usage: npm run setup-indices
 */

import dotenv from 'dotenv';
dotenv.config();

import { indexService } from '../src/services/elasticsearch/IndexService';
import { checkConnection } from '../src/config/elasticsearch';

async function main() {
  console.log('=== Elasticsearch Index Setup ===\n');

  // Check connection
  const connected = await checkConnection();
  if (!connected) {
    console.error('Cannot connect to Elasticsearch. Please check your configuration.');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const forceRecreate = args.includes('--force') || args.includes('-f');

  if (forceRecreate) {
    console.log('Force recreate mode: Will delete and recreate all indices\n');
    await indexService.recreateAllIndices();
  } else {
    console.log('Normal mode: Will only create indices if they do not exist\n');
    await indexService.initAllIndices();
  }

  // Show index stats
  console.log('\n=== Index Statistics ===');
  for (const indexName of ['articles', 'products', 'posts']) {
    const exists = await indexService.indexExists(indexName);
    if (exists) {
      const stats = await indexService.getIndexStats(indexName);
      console.log(`${indexName}: ${stats.docCount} documents, ${Math.round(stats.sizeInBytes / 1024)} KB`);
    }
  }

  console.log('\nSetup completed successfully!');
  process.exit(0);
}

main().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
