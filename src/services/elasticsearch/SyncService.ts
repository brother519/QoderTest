import { esClient } from '../../config/elasticsearch';
import { articleService } from '../mysql/ArticleService';
import { productService } from '../mysql/ProductService';
import { postService } from '../mysql/PostService';
import { ARTICLES_INDEX } from '../../models/elasticsearch/ArticleIndex';
import { PRODUCTS_INDEX } from '../../models/elasticsearch/ProductIndex';
import { POSTS_INDEX } from '../../models/elasticsearch/PostIndex';
import type { Article, Product, Post, BulkOperation, ContentType } from '../../types/search.types';

export class SyncService {
  // Single document operations
  async syncDocument<T extends Record<string, unknown>>(
    index: string,
    id: number,
    document: T
  ): Promise<void> {
    await esClient.index({
      index,
      id: String(id),
      document: this.prepareDocument(document),
      refresh: true,
    });
  }

  async deleteDocument(index: string, id: number): Promise<void> {
    try {
      await esClient.delete({
        index,
        id: String(id),
        refresh: true,
      });
    } catch (error: unknown) {
      // Ignore not found errors
      if ((error as { meta?: { statusCode?: number } }).meta?.statusCode !== 404) {
        throw error;
      }
    }
  }

  async updateDocument<T extends Record<string, unknown>>(
    index: string,
    id: number,
    partialDoc: Partial<T>
  ): Promise<void> {
    await esClient.update({
      index,
      id: String(id),
      doc: this.prepareDocument(partialDoc),
      refresh: true,
    });
  }

  // Bulk operations
  async bulkSync(operations: BulkOperation[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (operations.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    const body: object[] = [];
    for (const op of operations) {
      if (op.action === 'delete') {
        body.push({ delete: { _index: op.index, _id: op.id } });
      } else if (op.action === 'index') {
        body.push({ index: { _index: op.index, _id: op.id } });
        body.push(this.prepareDocument(op.document || {}));
      } else if (op.action === 'update') {
        body.push({ update: { _index: op.index, _id: op.id } });
        body.push({ doc: this.prepareDocument(op.document || {}) });
      }
    }

    const response = await esClient.bulk({ operations: body, refresh: true });

    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    if (response.items) {
      for (const item of response.items) {
        const result = item.index || item.update || item.delete;
        if (result?.error) {
          failed++;
          errors.push(`${result._id}: ${result.error.reason || 'Unknown error'}`);
        } else {
          success++;
        }
      }
    }

    return { success, failed, errors };
  }

  // Full sync operations
  async syncAllArticles(batchSize = 500): Promise<number> {
    console.log('Starting full sync for articles...');
    let synced = 0;
    let offset = 0;

    while (true) {
      const articles = await articleService.findAll(batchSize, offset);
      if (articles.length === 0) break;

      const operations: BulkOperation[] = articles.map(article => ({
        action: 'index' as const,
        index: ARTICLES_INDEX,
        id: String(article.id),
        document: this.articleToDocument(article),
      }));

      const result = await this.bulkSync(operations);
      synced += result.success;
      offset += batchSize;

      console.log(`Synced ${synced} articles...`);
    }

    console.log(`Full sync completed: ${synced} articles`);
    return synced;
  }

  async syncAllProducts(batchSize = 500): Promise<number> {
    console.log('Starting full sync for products...');
    let synced = 0;
    let offset = 0;

    while (true) {
      const products = await productService.findAll(batchSize, offset);
      if (products.length === 0) break;

      const operations: BulkOperation[] = products.map(product => ({
        action: 'index' as const,
        index: PRODUCTS_INDEX,
        id: String(product.id),
        document: this.productToDocument(product),
      }));

      const result = await this.bulkSync(operations);
      synced += result.success;
      offset += batchSize;

      console.log(`Synced ${synced} products...`);
    }

    console.log(`Full sync completed: ${synced} products`);
    return synced;
  }

  async syncAllPosts(batchSize = 500): Promise<number> {
    console.log('Starting full sync for posts...');
    let synced = 0;
    let offset = 0;

    while (true) {
      const posts = await postService.findAll(batchSize, offset);
      if (posts.length === 0) break;

      const operations: BulkOperation[] = posts.map(post => ({
        action: 'index' as const,
        index: POSTS_INDEX,
        id: String(post.id),
        document: this.postToDocument(post),
      }));

      const result = await this.bulkSync(operations);
      synced += result.success;
      offset += batchSize;

      console.log(`Synced ${synced} posts...`);
    }

    console.log(`Full sync completed: ${synced} posts`);
    return synced;
  }

  async syncAll(): Promise<{ articles: number; products: number; posts: number }> {
    const articles = await this.syncAllArticles();
    const products = await this.syncAllProducts();
    const posts = await this.syncAllPosts();
    return { articles, products, posts };
  }

  // Convenience methods for syncing specific content types
  async syncArticle(article: Article): Promise<void> {
    await this.syncDocument(ARTICLES_INDEX, article.id, this.articleToDocument(article));
  }

  async syncProduct(product: Product): Promise<void> {
    await this.syncDocument(PRODUCTS_INDEX, product.id, this.productToDocument(product));
  }

  async syncPost(post: Post): Promise<void> {
    await this.syncDocument(POSTS_INDEX, post.id, this.postToDocument(post));
  }

  async deleteArticle(id: number): Promise<void> {
    await this.deleteDocument(ARTICLES_INDEX, id);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.deleteDocument(PRODUCTS_INDEX, id);
  }

  async deletePost(id: number): Promise<void> {
    await this.deleteDocument(POSTS_INDEX, id);
  }

  // Document transformation
  private articleToDocument(article: Article): Record<string, unknown> {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      author_id: article.author_id,
      author_name: article.author_name,
      category: article.category,
      tags: article.tags,
      status: article.status,
      view_count: article.view_count,
      created_at: article.created_at,
      updated_at: article.updated_at,
    };
  }

  private productToDocument(product: Product): Record<string, unknown> {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      detail: product.detail,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      sales_count: product.sales_count,
      tags: product.tags,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  private postToDocument(post: Post): Record<string, unknown> {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      user_id: post.user_id,
      user_name: post.user_name,
      topic: post.topic,
      tags: post.tags,
      like_count: post.like_count,
      comment_count: post.comment_count,
      status: post.status,
      created_at: post.created_at,
      updated_at: post.updated_at,
    };
  }

  private prepareDocument<T extends Record<string, unknown>>(doc: T): Record<string, unknown> {
    const prepared: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(doc)) {
      if (value !== undefined) {
        prepared[key] = value;
      }
    }
    return prepared;
  }
}

export const syncService = new SyncService();
