import 'dotenv/config';
import { connectDB } from './config/db';
import logger from './config/logger';
import app from './app';

const PORT = parseInt(process.env.PORT || '4001');

const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Pet Pooja API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

process.on('unhandledRejection', (err) => { logger.error('Unhandled rejection', err); process.exit(1); });
process.on('uncaughtException', (err) => { logger.error('Uncaught exception', err); process.exit(1); });

start();
