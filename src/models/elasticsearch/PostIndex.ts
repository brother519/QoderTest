import type { MappingTypeMapping, IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

export const POSTS_INDEX = 'posts';

export const postsSettings: IndicesIndexSettings = {
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

export const postsMapping: MappingTypeMapping = {
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
    content: {
      type: 'text',
      analyzer: 'ik_max_word',
      search_analyzer: 'ik_smart',
    },
    user_id: { type: 'integer' },
    user_name: {
      type: 'text',
      analyzer: 'ik_smart',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    topic: { type: 'keyword' },
    tags: { type: 'keyword' },
    like_count: { type: 'integer' },
    comment_count: { type: 'integer' },
    status: { type: 'keyword' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' },
  },
};
