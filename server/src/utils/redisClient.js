import Redis from 'ioredis';
import logger from './logger.js';
import "dotenv/config";

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

      // Base configuration shared by both clients
      const baseOptions = {
        retryStrategy: (times) => {
          this.retryCount = times;
          if (times > this.maxRetries) {
            logger.error(`Redis connection failed after ${times} attempts`);
            return null; // Stop retrying
          }
          const delay = Math.min(times * 200, 5000); 
          logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times}/${this.maxRetries})`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        // CRITICAL: Redis Cloud requires TLS. This activates it if using rediss://
        tls: redisUrl?.startsWith('rediss://') ? {} : undefined,
        connectTimeout: 15000,
        keepAlive: 30000,
      };

      // Configuration for manual host/port setup (Fallback)
      const hostOptions = {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
      };

      // 1. Initialize main client
      this.client = redisUrl
        ? new Redis(redisUrl, baseOptions)
        : new Redis({ ...hostOptions, ...baseOptions });

      // 2. Initialize subscriber (ioredis requires a dedicated connection for Pub/Sub)
      this.subscriber = redisUrl
        ? new Redis(redisUrl, baseOptions)
        : new Redis({ ...hostOptions, ...baseOptions });

      // Event handlers
      this.client.on('ready', () => {
        this.isConnected = true;
        this.retryCount = 0;
        logger.info('Redis client connected successfully');
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      // Wait for 'ready' before proceeding
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Redis connection timeout')), 15000);
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

  // --- Core Operations ---
  async get(key) {
    try {
      const value = await this.client.get(key);
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      logger.error(`Redis GET error for ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttl) return await this.client.setex(key, ttl, data);
      return await this.client.set(key, data);
    } catch (error) {
      logger.error(`Redis SET error for ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      return (await this.client.del(key)) > 0;
    } catch (error) {
      logger.error(`Redis DEL error:`, error);
      return false;
    }
  }

  // --- Pub/Sub Operations ---
  async publish(channel, message) {
    try {
      const data = typeof message === 'object' ? JSON.stringify(message) : String(message);
      return await this.client.publish(channel, data);
    } catch (error) {
      logger.error(`Redis Publish error on ${channel}:`, error);
      return 0;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) {
          try {
            callback(JSON.parse(message));
          } catch {
            callback(message);
          }
        }
      });
      return true;
    } catch (error) {
      logger.error(`Redis Subscribe error on ${channel}:`, error);
      return false;
    }
  }

  // --- Health & Maintenance ---
  async healthCheck() {
    try {
      await this.client.ping();
      return { status: 'healthy', connected: this.isConnected };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async disconnect() {
    try {
      await Promise.all([
        this.client?.quit(),
        this.subscriber?.quit()
      ]);
      this.isConnected = false;
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }
}

// Singleton pattern
const redisClient = new RedisClient();
redisClient.connect().catch(err => logger.error("Critical Redis Startup Error:", err));

export default redisClient;
