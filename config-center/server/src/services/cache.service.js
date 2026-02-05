const { getRedis } = require('../config/redis');
const config = require('../config/app.config');

class CacheService {
  constructor() {
    this.prefix = config.cache.prefix;
    this.ttl = config.cache.ttl;
  }
  
  // Build cache key
  buildKey(serviceName, environment, configKey) {
    return `${this.prefix}${serviceName}:${environment}:${configKey}`;
  }
  
  buildAllKey(serviceName, environment) {
    return `${this.prefix}all:${serviceName}:${environment}`;
  }
  
  buildVersionKey(serviceName, environment) {
    return `${this.prefix}version:${serviceName}:${environment}`;
  }
  
  // Get single config from cache
  async getConfig(serviceName, environment, configKey) {
    try {
      const redis = getRedis();
      const key = this.buildKey(serviceName, environment, configKey);
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }
  
  // Set single config to cache
  async setConfig(serviceName, environment, configKey, value) {
    try {
      const redis = getRedis();
      const key = this.buildKey(serviceName, environment, configKey);
      await redis.setex(key, this.ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error.message);
    }
  }
  
  // Delete single config from cache
  async deleteConfig(serviceName, environment, configKey) {
    try {
      const redis = getRedis();
      const key = this.buildKey(serviceName, environment, configKey);
      const allKey = this.buildAllKey(serviceName, environment);
      
      await redis.del(key);
      await redis.del(allKey);
      
      // Update version timestamp
      const versionKey = this.buildVersionKey(serviceName, environment);
      await redis.set(versionKey, Date.now().toString());
    } catch (error) {
      console.error('Cache delete error:', error.message);
    }
  }
  
  // Get all configs for a service/environment
  async getAllConfigs(serviceName, environment) {
    try {
      const redis = getRedis();
      const key = this.buildAllKey(serviceName, environment);
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get all error:', error.message);
      return null;
    }
  }
  
  // Set all configs for a service/environment
  async setAllConfigs(serviceName, environment, configs) {
    try {
      const redis = getRedis();
      const key = this.buildAllKey(serviceName, environment);
      await redis.setex(key, this.ttl * 2, JSON.stringify(configs));
    } catch (error) {
      console.error('Cache set all error:', error.message);
    }
  }
  
  // Get version timestamp
  async getVersion(serviceName, environment) {
    try {
      const redis = getRedis();
      const key = this.buildVersionKey(serviceName, environment);
      const version = await redis.get(key);
      return version ? parseInt(version) : 0;
    } catch (error) {
      console.error('Cache get version error:', error.message);
      return 0;
    }
  }
  
  // Publish config change event
  async publishChange(serviceName, environment, changeData) {
    try {
      const redis = getRedis();
      const channel = `channel:${this.prefix}${serviceName}:${environment}`;
      await redis.publish(channel, JSON.stringify(changeData));
    } catch (error) {
      console.error('Cache publish error:', error.message);
    }
  }
}

module.exports = new CacheService();
