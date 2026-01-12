import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  requestTimeout: 5000,
  maxRetries: 3,
});

export async function checkConnection(): Promise<boolean> {
  try {
    const health = await esClient.cluster.health({});
    console.log(`Elasticsearch cluster status: ${health.status}`);
    return true;
  } catch (error) {
    console.error('Elasticsearch connection failed:', error);
    return false;
  }
}

export { esClient };
