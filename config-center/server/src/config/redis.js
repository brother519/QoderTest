const Redis = require('ioredis');
const config = require('./app.config');

let redis = null;
let subscriber = null;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
    
    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });
    
    redis.on('connect', () => {
      console.log('Redis connected');
    });
  }
  return redis;
}

function getSubscriber() {
  if (!subscriber) {
    subscriber = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined
    });
    
    subscriber.on('error', (err) => {
      console.error('Redis subscriber error:', err.message);
    });
  }
  return subscriber;
}

module.exports = {
  getRedis,
  getSubscriber
};
