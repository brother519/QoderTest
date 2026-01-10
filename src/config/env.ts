import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  baseUrl: string;
  database: {
    url: string;
    poolMin: number;
    poolMax: number;
  };
  redis: {
    url: string;
    password?: string;
    db: number;
  };
  cache: {
    ttlShortUrl: number;
    ttlAnalytics: number;
    ttlRanking: number;
  };
  rateLimit: {
    create: number;
    query: number;
    redirect: number;
  };
  log: {
    level: string;
    filePath: string;
  };
  shortCode: {
    length: number;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || 'postgres://shortlink:password@localhost:5432/shortlink',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  cache: {
    ttlShortUrl: parseInt(process.env.CACHE_TTL_SHORT_URL || '3600', 10),
    ttlAnalytics: parseInt(process.env.CACHE_TTL_ANALYTICS || '1800', 10),
    ttlRanking: parseInt(process.env.CACHE_TTL_RANKING || '28800', 10),
  },
  rateLimit: {
    create: parseInt(process.env.RATE_LIMIT_CREATE || '10', 10),
    query: parseInt(process.env.RATE_LIMIT_QUERY || '100', 10),
    redirect: parseInt(process.env.RATE_LIMIT_REDIRECT || '1000', 10),
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
  shortCode: {
    length: parseInt(process.env.SHORT_CODE_LENGTH || '6', 10),
  },
};

export default config;
