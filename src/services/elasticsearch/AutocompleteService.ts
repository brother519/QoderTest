import { esClient } from '../../config/elasticsearch';
import type { AutocompleteParams, AutocompleteResult, Suggestion, ContentType } from '../../types/search.types';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

const ALL_INDICES: ContentType[] = ['articles', 'products', 'posts'];

export class AutocompleteService {
  async getSuggestions(params: AutocompleteParams): Promise<AutocompleteResult> {
    const { prefix, type, limit = 5 } = params;

    if (!prefix || prefix.trim().length === 0) {
      return { success: true, data: { suggestions: [] } };
    }

    const indices = type ? [type] : ALL_INDICES;

    try {
      const response = await esClient.search({
        index: indices,
        suggest: {
          title_suggest: {
            prefix: prefix.trim(),
            completion: {
              field: 'title.suggest',
              size: limit,
              skip_duplicates: true,
              fuzzy: {
                fuzziness: 'AUTO',
              },
            },
          },
        },
      });

      return this.parseResponse(response);
    } catch (error) {
      // Fallback to prefix query if completion suggester fails
      console.warn('Completion suggest failed, falling back to prefix query:', error);
      return this.fallbackSearch(prefix, indices, limit);
    }
  }

  private async fallbackSearch(
    prefix: string,
    indices: ContentType[],
    limit: number
  ): Promise<AutocompleteResult> {
    const response: SearchResponse = await esClient.search({
      index: indices,
      size: limit,
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                title: {
                  query: prefix,
                  max_expansions: 10,
                },
              },
            },
            {
              match_phrase_prefix: {
                name: {
                  query: prefix,
                  max_expansions: 10,
                },
              },
            },
          ],
        },
      },
      _source: ['title', 'name'],
    });

    const suggestions: Suggestion[] = response.hits.hits.map(hit => {
      const source = hit._source as Record<string, unknown>;
      return {
        text: (source.title || source.name || '') as string,
        type: hit._index as ContentType,
        score: hit._score || 0,
      };
    });

    return { success: true, data: { suggestions } };
  }

  private parseResponse(response: SearchResponse): AutocompleteResult {
    const suggestions: Suggestion[] = [];
    const suggest = response.suggest as Record<string, Array<{
      options: Array<{
        text: string;
        _index: string;
        _score: number;
      }>;
    }>>;

    if (suggest?.title_suggest) {
      for (const suggestion of suggest.title_suggest) {
        for (const option of suggestion.options) {
          suggestions.push({
            text: option.text,
            type: option._index as ContentType,
            score: option._score,
          });
        }
      }
    }

    return { success: true, data: { suggestions } };
  }

  async getHotKeywords(limit = 10): Promise<string[]> {
    // This would typically query a search logs table
    // For now, return common categories/topics as a placeholder
    const response = await esClient.search({
      index: ALL_INDICES,
      size: 0,
      aggs: {
        hot_categories: {
          terms: { field: 'category', size: limit },
        },
        hot_topics: {
          terms: { field: 'topic', size: limit },
        },
      },
    });

    const aggs = response.aggregations as Record<string, {
      buckets: Array<{ key: string }>;
    }>;
    
    const keywords: string[] = [];
    
    if (aggs?.hot_categories?.buckets) {
      keywords.push(...aggs.hot_categories.buckets.map(b => b.key));
    }
    if (aggs?.hot_topics?.buckets) {
      keywords.push(...aggs.hot_topics.buckets.map(b => b.key));
    }

    return [...new Set(keywords)].slice(0, limit);
  }
}

export const autocompleteService = new AutocompleteService();
