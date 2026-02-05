import type { MappingTypeMapping, IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

export const ARTICLES_INDEX = 'articles';

export const articlesSettings: IndicesIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0,
  analysis: {
    analyzer: {
      ik_max_word_analyzer: {
        type: 'custom',
        tokenizer: 'ik_max_word',
        filter: ['lowercase'],
      },
      ik_smart_analyzer: {
        type: 'custom',
        tokenizer: 'ik_smart',
        filter: ['lowercase'],
      },
    },
  },
};

export const articlesMapping: MappingTypeMapping = {
  properties: {
    id: { type: 'integer' },
    title: {
      type: 'text',
      analyzer: 'ik_max_word',
      search_analyzer: 'ik_smart',
      fields: {
        keyword: { type: 'keyword' },
        suggest: {
          type: 'completion',
          analyzer: 'ik_max_word',
        },
      },
    },
    description: {
      type: 'text',
      analyzer: 'ik_max_word',
      search_analyzer: 'ik_smart',
    },
    content: {
      type: 'text',
      analyzer: 'ik_max_word',
      search_analyzer: 'ik_smart',
    },
    author_id: { type: 'integer' },
    author_name: {
      type: 'text',
      analyzer: 'ik_smart',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    category: { type: 'keyword' },
    tags: { type: 'keyword' },
    status: { type: 'keyword' },
    view_count: { type: 'integer' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' },
  },
};
