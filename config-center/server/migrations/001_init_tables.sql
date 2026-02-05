-- Create configs table
CREATE TABLE IF NOT EXISTS configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
    environment ENUM('dev', 'test', 'prod') NOT NULL COMMENT '环境',
    config_key VARCHAR(200) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    value_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string' COMMENT '值类型',
    description VARCHAR(500) COMMENT '配置说明',
    validator_rules JSON COMMENT '校验规则',
    version INT DEFAULT 1 COMMENT '当前版本号',
    is_encrypted BOOLEAN DEFAULT FALSE COMMENT '是否加密存储',
    created_by VARCHAR(100) COMMENT '创建人',
    updated_by VARCHAR(100) COMMENT '最后修改人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_service_env_key (service_name, environment, config_key),
    INDEX idx_service_env (service_name, environment),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置表';

-- Create config_versions table
CREATE TABLE IF NOT EXISTS config_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_id BIGINT NOT NULL COMMENT '关联configs表',
    service_name VARCHAR(100) NOT NULL,
    environment ENUM('dev', 'test', 'prod') NOT NULL,
    config_key VARCHAR(200) NOT NULL,
    config_value TEXT COMMENT '历史版本的值',
    value_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    version INT NOT NULL COMMENT '版本号',
    change_type ENUM('create', 'update', 'delete', 'rollback') NOT NULL COMMENT '变更类型',
    change_description VARCHAR(500) COMMENT '变更说明',
    created_by VARCHAR(100) COMMENT '变更人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_config_id (config_id),
    INDEX idx_service_env_key (service_name, environment, config_key),
    INDEX idx_version (config_id, version),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置版本历史表';

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operation_type ENUM('create', 'update', 'delete', 'rollback', 'query') NOT NULL COMMENT '操作类型',
    resource_type ENUM('config', 'version', 'validator') DEFAULT 'config' COMMENT '资源类型',
    resource_id BIGINT COMMENT '关联的资源ID',
    service_name VARCHAR(100),
    environment VARCHAR(50),
    config_key VARCHAR(200),
    before_value TEXT COMMENT '修改前的值',
    after_value TEXT COMMENT '修改后的值',
    operator VARCHAR(100) NOT NULL COMMENT '操作人',
    operator_ip VARCHAR(50) COMMENT '操作IP',
    user_agent VARCHAR(500) COMMENT '浏览器标识',
    operation_status ENUM('success', 'failed') DEFAULT 'success',
    error_message TEXT COMMENT '失败原因',
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_operator (operator),
    INDEX idx_service_env (service_name, environment),
    INDEX idx_operation_time (operation_time),
    INDEX idx_resource (resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';
