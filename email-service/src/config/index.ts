import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().url(),
  
  DATABASE_URL: z.string(),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  SENDGRID_API_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string().email(),
  SENDGRID_FROM_NAME: z.string().default('Email Service'),
  
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_SES_FROM_EMAIL: z.string().email(),
  
  UNSUBSCRIBE_SECRET: z.string(),
  API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Environment validation failed:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }
  
  return result.data;
}

export const env = loadEnv();

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  apiBaseUrl: env.API_BASE_URL,
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: env.REDIS_PASSWORD || undefined,
  },
  
  sendgrid: {
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.SENDGRID_FROM_EMAIL,
    fromName: env.SENDGRID_FROM_NAME,
  },
  
  awsSes: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    fromEmail: env.AWS_SES_FROM_EMAIL,
  },
  
  unsubscribe: {
    secret: env.UNSUBSCRIBE_SECRET,
    tokenExpiry: '7d',
  },
  
  api: {
    key: env.API_KEY,
  },
  
  queue: {
    emailQueue: 'email-queue',
    batchQueue: 'batch-queue',
    defaultConcurrency: 5,
    retryAttempts: 5,
    retryDelay: [60000, 300000, 900000, 3600000], // 1min, 5min, 15min, 1hr
  },
  
  failover: {
    maxConsecutiveFailures: 3,
    healthCheckInterval: 60000, // 1 minute
    recoveryCheckInterval: 300000, // 5 minutes
    requestTimeout: 5000, // 5 seconds
  },
  
  tracking: {
    deduplicationTTL: 86400, // 24 hours in seconds
  },
} as const;

export type Config = typeof config;
