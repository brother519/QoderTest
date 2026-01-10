-- 创建clicks表
CREATE TABLE IF NOT EXISTS clicks (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50)
);

-- 添加注释
COMMENT ON TABLE clicks IS '点击追踪表';
COMMENT ON COLUMN clicks.url_id IS '关联的短链接ID';
COMMENT ON COLUMN clicks.ip_address IS 'IP地址';
COMMENT ON COLUMN clicks.user_agent IS '用户代理字符串';
COMMENT ON COLUMN clicks.referer IS '来源页面';
COMMENT ON COLUMN clicks.country IS '国家代码（ISO 3166-1 alpha-2）';
COMMENT ON COLUMN clicks.device_type IS '设备类型：desktop/mobile/tablet/bot';
