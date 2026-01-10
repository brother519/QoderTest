-- 创建urls表
CREATE TABLE IF NOT EXISTS urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    custom_domain VARCHAR(255),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    user_id VARCHAR(255),
    click_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP,
    metadata JSONB
);

-- 添加注释
COMMENT ON TABLE urls IS '短链接主表';
COMMENT ON COLUMN urls.short_code IS '短代码，Base62编码';
COMMENT ON COLUMN urls.original_url IS '原始长链接';
COMMENT ON COLUMN urls.custom_domain IS '自定义域名';
COMMENT ON COLUMN urls.expires_at IS '过期时间，NULL表示永久有效';
COMMENT ON COLUMN urls.click_count IS '点击总数（冗余字段）';
COMMENT ON COLUMN urls.metadata IS '扩展元数据，JSON格式';
