-- Buckets
CREATE TABLE IF NOT EXISTS buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    access_type VARCHAR(20) NOT NULL DEFAULT 'private',
    allowed_file_types JSONB DEFAULT '[]'::jsonb,
    max_file_size BIGINT DEFAULT 5368709120,
    cdn_prefix VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Files
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id UUID NOT NULL REFERENCES buckets(id),
    file_key VARCHAR(512) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) DEFAULT '/',
    mime_type VARCHAR(127),
    file_size BIGINT NOT NULL,
    checksum VARCHAR(128),
    access_type VARCHAR(20) NOT NULL DEFAULT 'private',
    metadata JSONB DEFAULT '{}'::jsonb,
    ttl_expires_at TIMESTAMP,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_files_bucket_path ON files(bucket_id, file_path);
CREATE INDEX IF NOT EXISTS idx_files_ttl ON files(ttl_expires_at) WHERE ttl_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_deleted_at ON files(deleted_at) WHERE deleted_at IS NULL;

-- Thumbnails
CREATE TABLE IF NOT EXISTS thumbnails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    size_name VARCHAR(20) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    file_key VARCHAR(512) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(file_id, size_name)
);

-- Upload Sessions
CREATE TABLE IF NOT EXISTS upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id UUID NOT NULL REFERENCES buckets(id),
    upload_id VARCHAR(512) NOT NULL,
    file_key VARCHAR(512) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(127),
    total_size BIGINT NOT NULL,
    chunk_size BIGINT NOT NULL,
    total_chunks INT NOT NULL,
    uploaded_chunks JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status, expires_at);

-- Signed URLs
CREATE TABLE IF NOT EXISTS signed_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    url_token VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    max_downloads INT,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signed_urls_token ON signed_urls(url_token, expires_at);

-- Storage Statistics
CREATE TABLE IF NOT EXISTS storage_statistics (
    id SERIAL PRIMARY KEY,
    bucket_id UUID REFERENCES buckets(id),
    date DATE NOT NULL,
    file_count BIGINT DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    bandwidth_upload BIGINT DEFAULT 0,
    bandwidth_download BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(bucket_id, date)
);
