// User types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  username: string;
}

// Link types
export interface Link {
  id: number;
  short_code: string;
  original_url: string;
  user_id: number;
  custom_domain_id: number | null;
  title: string | null;
  description: string | null;
  expires_at: Date | null;
  is_active: boolean;
  click_count: number;
  qr_code_path: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLinkInput {
  original_url: string;
  custom_code?: string;
  title?: string;
  description?: string;
  expires_at?: Date;
  custom_domain_id?: number;
}

export interface UpdateLinkInput {
  title?: string;
  description?: string;
  expires_at?: Date | null;
  is_active?: boolean;
}

// Click types
export interface Click {
  id: number;
  link_id: number;
  clicked_at: Date;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  referer: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
}

export interface CreateClickInput {
  link_id: number;
  ip_address?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  referer?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  device_type?: string;
}

// Domain types
export interface Domain {
  id: number;
  domain: string;
  user_id: number;
  is_verified: boolean;
  verification_token: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDomainInput {
  domain: string;
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
  total_clicks: number;
  active_links: number;
  top_links: (Link & { click_count: number })[];
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
