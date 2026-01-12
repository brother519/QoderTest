import { esClient } from '../../config/elasticsearch';
import type {
  SearchParams,
  SearchResult,
  SearchHit,
  SearchFilters,
  SortOption,
  ContentType,
  Aggregations,
} from '../../types/search.types';
import type { SearchResponse, SearchHit as ESSearchHit } from '@elastic/elasticsearch/lib/api/types';

const ALL_INDICES: ContentType[] = ['articles', 'products', 'posts'];

export class SearchService {
  async search(params: SearchParams): Promise<SearchResult> {
    const {
      query,
      types = ALL_INDICES,
      filters,
      sort,
      page = 1,
      size = 10,
      highlight = true,
    } = params;

    const searchQuery = this.buildQuery(query, filters);
    const from = (page - 1) * size;

    try {
      const response: SearchResponse = await esClient.search({
        index: types,
        query: searchQuery,
        from,
        size,
        highlight: highlight ? this.buildHighlight() : undefined,
        sort: this.buildSort(sort),
        aggs: this.buildAggregations(),
        track_total_hits: true,
      });

      return this.parseResponse(response, types);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private buildQuery(query: string, filters?: SearchFilters) {
    const must: object[] = [];
    const filter: object[] = [];

    // Main search query with multi_match
    if (query && query.trim()) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: [
            'title^3',
            'name^3',
            'description^2',
            'content',
            'detail',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 1,
        },
      });
    } else {
      must.push({ match_all: {} });
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        filter.push({ term: { category: filters.category } });
      }
      if (filters.author) {
        filter.push({
          bool: {
            should: [
              { term: { 'author_name.keyword': filters.author } },
              { term: { 'user_name.keyword': filters.author } },
            ],
          },
        });
      }
      if (filters.brand) {
        filter.push({ term: { 'brand.keyword': filters.brand } });
      }
      if (filters.topic) {
        filter.push({ term: { topic: filters.topic } });
      }
      if (filters.status) {
        filter.push({ term: { status: filters.status } });
      }
      if (filters.dateRange) {
        filter.push({
          range: {
            created_at: {
              gte: filters.dateRange.start,
              lte: filters.dateRange.end,
            },
          },
        });
      }
      if (filters.priceRange) {
        filter.push({
          range: {
            price: {
              gte: filters.priceRange.min,
              lte: filters.priceRange.max,
            },
          },
        });
      }
    }

    return {
      bool: {
        must,
        filter,
      },
    };
  }

  private buildHighlight() {
    return {
      fields: {
        title: { number_of_fragments: 0 },
        name: { number_of_fragments: 0 },
        description: { fragment_size: 150, number_of_fragments: 2 },
        content: { fragment_size: 150, number_of_fragments: 3 },
        detail: { fragment_size: 150, number_of_fragments: 2 },
      },
      pre_tags: ['<em>'],
      post_tags: ['</em>'],
    };
  }

  private buildSort(sort?: SortOption): object[] {
    if (sort) {
      return [{ [sort.field]: { order: sort.order } }];
    }
    // Default sort: by relevance score, then by date
    return [
      { _score: { order: 'desc' } },
      { created_at: { order: 'desc' } },
    ];
  }

  private buildAggregations() {
    return {
      categories: {
        terms: { field: 'category', size: 20 },
      },
      authors: {
        terms: { field: 'author_name.keyword', size: 20 },
      },
      brands: {
        terms: { field: 'brand.keyword', size: 20 },
      },
      topics: {
        terms: { field: 'topic', size: 20 },
      },
    };
  }

  private parseResponse(response: SearchResponse, types: ContentType[]): SearchResult {
    const total = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value || 0;

    const results: SearchHit[] = response.hits.hits.map((hit: ESSearchHit<Record<string, unknown>>) => {
      const source = hit._source || {};
      const indexName = hit._index as ContentType;

      return {
        type: indexName,
        id: source.id as number || parseInt(hit._id || '0', 10),
        title: (source.title || source.name || '') as string,
        description: (source.description || '') as string,
        score: hit._score || 0,
        highlight: hit.highlight ? {
          title: hit.highlight.title || hit.highlight.name,
          description: hit.highlight.description,
          content: hit.highlight.content || hit.highlight.detail,
        } : undefined,
        metadata: this.extractMetadata(source, indexName),
      };
    });

    const aggregations = this.parseAggregations(response.aggregations);

    return {
      success: true,
      data: {
        total,
        took: response.took,
        results,
        aggregations,
      },
    };
  }

  private extractMetadata(source: Record<string, unknown>, type: ContentType): Record<string, unknown> {
    const metadata: Record<string, unknown> = {
      created_at: source.created_at,
    };

    switch (type) {
      case 'articles':
        metadata.author = source.author_name;
        metadata.category = source.category;
        metadata.view_count = source.view_count;
        break;
      case 'products':
        metadata.brand = source.brand;
        metadata.category = source.category;
        metadata.price = source.price;
        metadata.sales_count = source.sales_count;
        break;
      case 'posts':
        metadata.user = source.user_name;
        metadata.topic = source.topic;
        metadata.like_count = source.like_count;
        break;
    }

    return metadata;
  }

  private parseAggregations(aggs?: Record<string, unknown>): Aggregations | undefined {
    if (!aggs) return undefined;

    const parseTermsAgg = (agg: { buckets?: Array<{ key: string; doc_count: number }> }) => {
      return agg.buckets?.map(bucket => ({
        key: bucket.key,
        count: bucket.doc_count,
      })) || [];
    };

    return {
      categories: parseTermsAgg(aggs.categories as { buckets?: Array<{ key: string; doc_count: number }> }),
      authors: parseTermsAgg(aggs.authors as { buckets?: Array<{ key: string; doc_count: number }> }),
      brands: parseTermsAgg(aggs.brands as { buckets?: Array<{ key: string; doc_count: number }> }),
      topics: parseTermsAgg(aggs.topics as { buckets?: Array<{ key: string; doc_count: number }> }),
    };
  }
}

export const searchService = new SearchService();
