import mongoose from 'mongoose';
import { dbConfig } from '../config';
import { logger } from '../utils/logger.util';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(dbConfig.uri, {
      dbName: dbConfig.dbName,
    });
    logger.info('MongoDB connected successfully');
    
    // 监听连接事件
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
