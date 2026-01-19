// User types
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

// Link types
export interface Link {
  id: number;
  short_code: string;
  original_url: string;
  short_url: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  original_url: string;
  custom_code?: string;
  title?: string;
  description?: string;
  expires_at?: string;
}

export interface UpdateLinkInput {
  title?: string;
  description?: string;
  expires_at?: string | null;
  is_active?: boolean;
}

// Analytics types
export interface LinkStats {
  total_clicks: number;
  unique_visitors: number;
  clicks_by_country: { country: string; count: number }[];
  clicks_by_browser: { browser: string; count: number }[];
  clicks_by_os: { os: string; count: number }[];
  clicks_by_device: { device_type: string; count: number }[];
  clicks_by_date: { date: string; count: number }[];
  top_referers: { referer: string; count: number }[];
}

export interface DashboardStats {
  total_links: number;
  active_links: number;
  total_clicks: number;
  top_links: Link[];
  recent_activity: { date: string; clicks: number }[];
}

// Domain types
export interface Domain {
  id: number;
  domain: string;
  is_verified: boolean;
  verification_token: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
