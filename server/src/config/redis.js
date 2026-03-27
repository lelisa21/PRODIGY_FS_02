import redis from "redis";
import logger from "../utils/logger.js";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error("Redis max retries reached");
        return new Error("Redis max retries reached");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (error) => {
  logger.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  logger.info("Redis Client Connected");
});

export default redisClient;
