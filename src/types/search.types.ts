// Search request parameters
export interface SearchParams {
  query: string;
  types?: ContentType[];
  filters?: SearchFilters;
  sort?: SortOption;
  page?: number;
  size?: number;
  highlight?: boolean;
}

export type ContentType = 'articles' | 'products' | 'posts';

export interface SearchFilters {
  category?: string;
  author?: string;
  brand?: string;
  topic?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

// Search response
export interface SearchResult {
  success: boolean;
  data: {
    total: number;
    took: number;
    results: SearchHit[];
    aggregations?: Aggregations;
  };
}

export interface SearchHit {
  type: ContentType;
  id: number;
  title: string;
  description?: string;
  score: number;
  highlight?: {
    title?: string[];
    description?: string[];
    content?: string[];
  };
  metadata: Record<string, unknown>;
}

export interface Aggregations {
  categories?: AggregationBucket[];
  authors?: AggregationBucket[];
  brands?: AggregationBucket[];
  topics?: AggregationBucket[];
}

export interface AggregationBucket {
  key: string;
  count: number;
}

// Autocomplete
export interface AutocompleteParams {
  prefix: string;
  type?: ContentType;
  limit?: number;
}

export interface AutocompleteResult {
  success: boolean;
  data: {
    suggestions: Suggestion[];
  };
}

export interface Suggestion {
  text: string;
  type: ContentType;
  score: number;
}

// Sync operations
export interface BulkOperation {
  action: 'index' | 'update' | 'delete';
  index: string;
  id: string;
  document?: Record<string, unknown>;
}

// MySQL models
export interface Article {
  id: number;
  title: string;
  description?: string;
  content: string;
  author_id: number;
  author_name?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  detail?: string;
  brand?: string;
  category?: string;
  price?: number;
  stock: number;
  sales_count: number;
  tags?: string[];
  status: 'available' | 'out_of_stock' | 'discontinued';
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user_name?: string;
  topic?: string;
  tags?: string[];
  like_count: number;
  comment_count: number;
  status: 'normal' | 'hidden' | 'deleted';
  created_at: Date;
  updated_at: Date;
}
