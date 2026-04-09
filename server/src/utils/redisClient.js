import Redis from 'ioredis';
import logger from './logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 10;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL;
      const baseOptions = {
        retryStrategy: (times) => {
          this.retryCount = times;
          if (times > this.maxRetries) {
            logger.error(`Redis connection failed after ${times} attempts`);
            return null;
          }
          const delay = Math.min(times * 100, 3000);
          logger.warn(
            `Redis reconnecting in ${delay}ms (attempt ${times}/${this.maxRetries})`,
          );
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        connectTimeout: 10000,
        disconnectTimeout: 2000,
        commandTimeout: 5000,
        keepAlive: 30000,
      };

      const hostOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
      };

      // Create Redis client with retry strategy
      this.client = redisUrl
        ? new Redis(redisUrl, baseOptions)
        : new Redis({ ...hostOptions, ...baseOptions });

      // Create subscriber client
      this.subscriber = redisUrl
        ? new Redis(redisUrl, {
            retryStrategy: (times) => Math.min(times * 100, 3000),
          })
        : new Redis({
            ...hostOptions,
            retryStrategy: (times) => Math.min(times * 100, 3000),
          });

      // Event handlers for main client
      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        this.retryCount = 0;
        logger.info('Redis client connected successfully');
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis client reconnecting...');
      });

      this.client.on('end', () => {
        logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      // Event handlers for subscriber
      this.subscriber.on('ready', () => {
        logger.info('Redis subscriber connected successfully');
      });

      this.subscriber.on('error', (error) => {
        logger.error('Redis subscriber error:', error);
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Redis connection timeout'));
        }, 10000);

        this.client.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.client.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  // Basic operations
  async get(key) {
    try {
      const value = await this.client.get(key);
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttl) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async setEx(key, ttl, value) {
    return this.set(key, value, ttl);
  }

  async del(key) {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        const result = await this.client.del(...keys);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error(`Redis DEL pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL error for key ${key}:`, error);
      return -2;
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      return null;
    }
  }

  async decr(key) {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`Redis DECR error for key ${key}:`, error);
      return null;
    }
  }

  // Hash operations
  async hset(hash, field, value) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await this.client.hset(hash, field, stringValue);
      return true;
    } catch (error) {
      logger.error(`Redis HSET error for hash ${hash}:`, error);
      return false;
    }
  }

  async hget(hash, field) {
    try {
      const value = await this.client.hget(hash, field);
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      logger.error(`Redis HGET error for hash ${hash}:`, error);
      return null;
    }
  }

  async hgetall(hash) {
    try {
      const data = await this.client.hgetall(hash);
      const parsed = {};
      for (const [key, value] of Object.entries(data)) {
        try {
          parsed[key] = JSON.parse(value);
        } catch {
          parsed[key] = value;
        }
      }
      return parsed;
    } catch (error) {
      logger.error(`Redis HGETALL error for hash ${hash}:`, error);
      return {};
    }
  }

  async hdel(hash, ...fields) {
    try {
      const result = await this.client.hdel(hash, ...fields);
      return result;
    } catch (error) {
      logger.error(`Redis HDEL error for hash ${hash}:`, error);
      return 0;
    }
  }

  // List operations
  async lpush(key, ...values) {
    try {
      const stringValues = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
      return await this.client.lpush(key, ...stringValues);
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
      return 0;
    }
  }

  async rpush(key, ...values) {
    try {
      const stringValues = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
      return await this.client.rpush(key, ...stringValues);
    } catch (error) {
      logger.error(`Redis RPUSH error for key ${key}:`, error);
      return 0;
    }
  }

  async lpop(key) {
    try {
      const value = await this.client.lpop(key);
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      logger.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  async rpop(key) {
    try {
      const value = await this.client.rpop(key);
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      logger.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  async lrange(key, start, stop) {
    try {
      const values = await this.client.lrange(key, start, stop);
      return values.map(v => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      });
    } catch (error) {
      logger.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  // Set operations
  async sadd(key, ...members) {
    try {
      const stringMembers = members.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m));
      return await this.client.sadd(key, ...stringMembers);
    } catch (error) {
      logger.error(`Redis SADD error for key ${key}:`, error);
      return 0;
    }
  }

  async smembers(key) {
    try {
      const members = await this.client.smembers(key);
      return members.map(m => {
        try {
          return JSON.parse(m);
        } catch {
          return m;
        }
      });
    } catch (error) {
      logger.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  async sismember(key, member) {
    try {
      const stringMember = typeof member === 'object' ? JSON.stringify(member) : String(member);
      return await this.client.sismember(key, stringMember);
    } catch (error) {
      logger.error(`Redis SISMEMBER error for key ${key}:`, error);
      return false;
    }
  }

  // Sorted Set operations
  async zadd(key, score, member) {
    try {
      const stringMember = typeof member === 'object' ? JSON.stringify(member) : String(member);
      return await this.client.zadd(key, score, stringMember);
    } catch (error) {
      logger.error(`Redis ZADD error for key ${key}:`, error);
      return 0;
    }
  }

  async zrange(key, start, stop, withScores = false) {
    try {
      if (withScores) {
        const results = await this.client.zrange(key, start, stop, 'WITHSCORES');
        const parsed = [];
        for (let i = 0; i < results.length; i += 2) {
          try {
            parsed.push({
              member: JSON.parse(results[i]),
              score: parseFloat(results[i + 1])
            });
          } catch {
            parsed.push({
              member: results[i],
              score: parseFloat(results[i + 1])
            });
          }
        }
        return parsed;
      }
      const results = await this.client.zrange(key, start, stop);
      return results.map(r => {
        try {
          return JSON.parse(r);
        } catch {
          return r;
        }
      });
    } catch (error) {
      logger.error(`Redis ZRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async zrevrange(key, start, stop, withScores = false) {
    try {
      if (withScores) {
        const results = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
        const parsed = [];
        for (let i = 0; i < results.length; i += 2) {
          try {
            parsed.push({
              member: JSON.parse(results[i]),
              score: parseFloat(results[i + 1])
            });
          } catch {
            parsed.push({
              member: results[i],
              score: parseFloat(results[i + 1])
            });
          }
        }
        return parsed;
      }
      const results = await this.client.zrevrange(key, start, stop);
      return results.map(r => {
        try {
          return JSON.parse(r);
        } catch {
          return r;
        }
      });
    } catch (error) {
      logger.error(`Redis ZREVRANGE error for key ${key}:`, error);
      return [];
    }
  }

  // Pub/Sub operations
  async publish(channel, message) {
    try {
      const stringMessage = typeof message === 'object' ? JSON.stringify(message) : String(message);
      const result = await this.client.publish(channel, stringMessage);
      return result;
    } catch (error) {
      logger.error(`Redis PUBLISH error on channel ${channel}:`, error);
      return 0;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) {
          try {
            const data = JSON.parse(message);
            callback(data);
          } catch {
            callback(message);
          }
        }
      });
      return true;
    } catch (error) {
      logger.error(`Redis SUBSCRIBE error on channel ${channel}:`, error);
      return false;
    }
  }

  async unsubscribe(channel) {
    try {
      await this.subscriber.unsubscribe(channel);
      return true;
    } catch (error) {
      logger.error(`Redis UNSUBSCRIBE error on channel ${channel}:`, error);
      return false;
    }
  }

  // Cache management
  async cacheGet(key) {
    return this.get(key);
  }

  async cacheSet(key, value, ttl = 3600) {
    return this.setEx(key, ttl, value);
  }

  async cacheDel(key) {
    return this.del(key);
  }

  async cacheFlush() {
    try {
      await this.client.flushdb();
      logger.info('Redis cache flushed');
      return true;
    } catch (error) {
      logger.error('Redis cache flush error:', error);
      return false;
    }
  }

  // Rate limiting
  async rateLimit(key, limit, window) {
    try {
      const current = await this.incr(key);
      if (current === 1) {
        await this.expire(key, window);
      }
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        reset: await this.ttl(key)
      };
    } catch (error) {
      logger.error(`Rate limit error for key ${key}:`, error);
      return { allowed: true, remaining: limit, reset: 0 };
    }
  }

  // Session management
  async setSession(sessionId, data, ttl = 86400) {
    return this.setEx(`session:${sessionId}`, ttl, data);
  }

  async getSession(sessionId) {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return this.del(`session:${sessionId}`);
  }

  // Queue operations
  async enqueue(queueName, job) {
    return this.rpush(`queue:${queueName}`, job);
  }

  async dequeue(queueName) {
    return this.lpop(`queue:${queueName}`);
  }

  async getQueueLength(queueName) {
    try {
      return await this.client.llen(`queue:${queueName}`);
    } catch (error) {
      logger.error(`Redis LLEN error for queue ${queueName}:`, error);
      return 0;
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.client.ping();
      return { status: 'healthy', connected: this.isConnected };
    } catch (error) {
      return { status: 'unhealthy', connected: false, error: error.message };
    }
  }

  // Disconnect
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
      }
      if (this.subscriber) {
        await this.subscriber.quit();
      }
      this.isConnected = false;
      logger.info('Redis disconnected');
      return true;
    } catch (error) {
      logger.error('Redis disconnect error:', error);
      return false;
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Initialize connection
redisClient.connect().catch(error => {
  logger.error('Failed to initialize Redis client:', error);
});

export default redisClient;
