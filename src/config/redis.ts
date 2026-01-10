import Redis from 'ioredis';
import config from './env';

const redis = new Redis(config.redis.url, {
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => {
  console.log('Redis已连接');
});

redis.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

redis.on('ready', () => {
  console.log('Redis已就绪');
});

export default redis;
