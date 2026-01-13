export interface UrlResponse {
  id: string;
  shortUrl: string;
  shortCode: string;
  longUrl: string;
  title?: string;
  qrCodeUrl?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  totalClicks?: number;
}

export interface CreateUrlRequest {
  longUrl: string;
  customCode?: string;
  title?: string;
  expiresAt?: string;
}

export interface UpdateUrlRequest {
  longUrl?: string;
  title?: string;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AnalyticsResponse {
  totalClicks: number;
  uniqueVisitors: number;
  timeSeries: { date: string; clicks: number }[];
  geography: { country: string; city?: string; clicks: number }[];
  referrers: { referrer: string; clicks: number }[];
  devices: { mobile: number; desktop: number; tablet: number; bot: number };
  browsers: { name: string; clicks: number }[];
  operatingSystems: { name: string; clicks: number }[];
}

export interface DashboardAnalyticsResponse {
  totalClicks: number;
  totalUrls: number;
  uniqueVisitors: number;
  topLinks: { id: string; shortCode: string; longUrl: string; clicks: number }[];
  timeSeries: { date: string; clicks: number }[];
  devices: { mobile: number; desktop: number; tablet: number; bot: number };
}

export interface ApiKeyResponse {
  id: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  rateLimit: number;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  key?: string; // Only on creation
}

export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  rateLimit?: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
