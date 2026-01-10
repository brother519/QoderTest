-- urls表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_original_url ON urls USING hash(original_url);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_urls_click_count ON urls(click_count DESC);

-- clicks表索引
CREATE INDEX IF NOT EXISTS idx_clicks_url_id_clicked_at ON clicks(url_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON clicks(device_type);

-- 性能优化：为常用查询场景添加复合索引
CREATE INDEX IF NOT EXISTS idx_urls_active_created ON urls(is_active, created_at DESC) WHERE is_active = TRUE;
