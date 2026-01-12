import type { MappingTypeMapping, IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

export const PRODUCTS_INDEX = 'products';

export const productsSettings: IndicesIndexSettings = {
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

export const productsMapping: MappingTypeMapping = {
  properties: {
    id: { type: 'integer' },
    name: {
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
    detail: {
      type: 'text',
      analyzer: 'ik_max_word',
      search_analyzer: 'ik_smart',
    },
    brand: {
      type: 'text',
      analyzer: 'ik_smart',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    category: { type: 'keyword' },
    price: { type: 'float' },
    stock: { type: 'integer' },
    sales_count: { type: 'integer' },
    tags: { type: 'keyword' },
    status: { type: 'keyword' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' },
  },
};
