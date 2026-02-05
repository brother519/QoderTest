import { esClient } from '../../config/elasticsearch';
import { ARTICLES_INDEX, articlesMapping, articlesSettings } from '../../models/elasticsearch/ArticleIndex';
import { PRODUCTS_INDEX, productsMapping, productsSettings } from '../../models/elasticsearch/ProductIndex';
import { POSTS_INDEX, postsMapping, postsSettings } from '../../models/elasticsearch/PostIndex';
import type { IndicesIndexSettings, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export class IndexService {
  async createIndex(
    indexName: string,
    settings: IndicesIndexSettings,
    mappings: MappingTypeMapping
  ): Promise<boolean> {
    try {
      const exists = await this.indexExists(indexName);
      if (exists) {
        console.log(`Index ${indexName} already exists`);
        return true;
      }

      await esClient.indices.create({
        index: indexName,
        settings,
        mappings,
      });
      console.log(`Index ${indexName} created successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to create index ${indexName}:`, error);
      throw error;
    }
  }

  async deleteIndex(indexName: string): Promise<boolean> {
    try {
      const exists = await this.indexExists(indexName);
      if (!exists) {
        console.log(`Index ${indexName} does not exist`);
        return true;
      }

      await esClient.indices.delete({ index: indexName });
      console.log(`Index ${indexName} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to delete index ${indexName}:`, error);
      throw error;
    }
  }

  async indexExists(indexName: string): Promise<boolean> {
    return await esClient.indices.exists({ index: indexName });
  }

  async initAllIndices(): Promise<void> {
    console.log('Initializing all indices...');

    await this.createIndex(ARTICLES_INDEX, articlesSettings, articlesMapping);
    await this.createIndex(PRODUCTS_INDEX, productsSettings, productsMapping);
    await this.createIndex(POSTS_INDEX, postsSettings, postsMapping);

    console.log('All indices initialized successfully');
  }

  async deleteAllIndices(): Promise<void> {
    console.log('Deleting all indices...');

    await this.deleteIndex(ARTICLES_INDEX);
    await this.deleteIndex(PRODUCTS_INDEX);
    await this.deleteIndex(POSTS_INDEX);

    console.log('All indices deleted successfully');
  }

  async recreateAllIndices(): Promise<void> {
    await this.deleteAllIndices();
    await this.initAllIndices();
  }

  async getIndexStats(indexName: string): Promise<{
    docCount: number;
    sizeInBytes: number;
  }> {
    const stats = await esClient.indices.stats({ index: indexName });
    const indexStats = stats._all.primaries;
    return {
      docCount: indexStats?.docs?.count || 0,
      sizeInBytes: indexStats?.store?.size_in_bytes || 0,
    };
  }

  async refreshIndex(indexName: string): Promise<void> {
    await esClient.indices.refresh({ index: indexName });
  }
}

export const indexService = new IndexService();
