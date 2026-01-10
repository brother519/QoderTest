export interface Url {
  id: number;
  short_code: string;
  original_url: string;
  custom_domain?: string;
  title?: string;
  created_at: Date;
  expires_at?: Date;
  is_active: boolean;
  user_id?: string;
  click_count: number;
  last_clicked_at?: Date;
  metadata?: Record<string, any>;
}

export interface Click {
  id: number;
  url_id: number;
  clicked_at: Date;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}

export interface CreateUrlInput {
  original_url: string;
  custom_code?: string;
  custom_domain?: string;
  title?: string;
  expires_in?: number;
  user_id?: string;
}

export interface ClickInput {
  url_id: number;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}
