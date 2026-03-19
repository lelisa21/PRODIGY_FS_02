import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import redisClient from './src/config/redis.js';
import logger from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    await redisClient.connect();
    logger.info(' Redis connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal');
      server.close(async () => {
        logger.info('HTTP server closed');
        await redisClient.quit();
        await mongoose.connection.close();
        logger.info('Database connections closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
