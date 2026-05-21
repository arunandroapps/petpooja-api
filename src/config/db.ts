import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petpooja_platform';
  try {
    await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection failed', err);
    process.exit(1);
  }
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
};
