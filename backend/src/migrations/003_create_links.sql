-- 003_create_links.sql
-- Links table for URL shortening

CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    custom_domain_id INTEGER REFERENCES domains(id) ON DELETE SET NULL,
    title VARCHAR(255),
    description TEXT,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    qr_code_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_expires_after_created 
        CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links(expires_at);
CREATE INDEX IF NOT EXISTS idx_links_click_count ON links(click_count DESC);

-- Trigger for updated_at
CREATE TRIGGER update_links_updated_at 
    BEFORE UPDATE ON links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
