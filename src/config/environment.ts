import dotenv from 'dotenv';
import path from 'path';

// 根据NODE_ENV加载对应的.env文件
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// 环境变量配置接口
interface EnvironmentConfig {
  // Server
  nodeEnv: string;
  port: number;
  apiPrefix: string;

  // Database
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password: string;
  };

  // S3
  s3: {
    endpoint?: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    uploadBucket: string;
    forcePathStyle: boolean;
  };

  // CDN
  cdn: {
    domain: string;
    enabled: boolean;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // Upload
  upload: {
    maxFileSize: number;
    chunkSize: number;
    sessionExpires: number;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Storage
  storage: {
    defaultQuota: number;
  };

  // Logging
  logging: {
    level: string;
    file: string;
  };

  // Swagger
  swagger: {
    enabled: boolean;
    path: string;
  };
}

// 获取环境变量值，提供默认值
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`环境变量 ${key} 未定义`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`环境变量 ${key} 未定义`);
    }
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`环境变量 ${key} 必须是数字`);
  }
  return parsed;
};

const getEnvBoolean = (key: string, defaultValue = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// 导出配置对象
export const config: EnvironmentConfig = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3000),
  apiPrefix: getEnv('API_PREFIX', '/api'),

  database: {
    host: getEnv('DATABASE_HOST', 'localhost'),
    port: getEnvNumber('DATABASE_PORT', 5432),
    name: getEnv('DATABASE_NAME', 'file_storage'),
    user: getEnv('DATABASE_USER', 'postgres'),
    password: getEnv('DATABASE_PASSWORD'),
    ssl: getEnvBoolean('DATABASE_SSL', false),
  },

  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: getEnv('REDIS_PASSWORD', ''),
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: getEnv('S3_REGION', 'us-east-1'),
    accessKeyId: getEnv('S3_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('S3_SECRET_ACCESS_KEY'),
    bucket: getEnv('S3_BUCKET'),
    uploadBucket: getEnv('S3_UPLOAD_BUCKET'),
    forcePathStyle: getEnvBoolean('S3_FORCE_PATH_STYLE', false),
  },

  cdn: {
    domain: getEnv('CDN_DOMAIN', ''),
    enabled: getEnvBoolean('CDN_ENABLED', false),
  },

  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  upload: {
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 5368709120), // 5GB
    chunkSize: getEnvNumber('CHUNK_SIZE', 10485760), // 10MB
    sessionExpires: getEnvNumber('UPLOAD_SESSION_EXPIRES', 86400), // 24 hours
  },

  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  storage: {
    defaultQuota: getEnvNumber('DEFAULT_USER_QUOTA', 10737418240), // 10GB
  },

  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
    file: getEnv('LOG_FILE', 'logs/app.log'),
  },

  swagger: {
    enabled: getEnvBoolean('SWAGGER_ENABLED', false),
    path: getEnv('SWAGGER_PATH', '/api-docs'),
  },
};

export default config;
