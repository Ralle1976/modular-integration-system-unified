import "reflect-metadata";
import { config } from 'dotenv';
import { logger } from './utils/logger';

// Load environment variables
config();

async function main() {
  try {
    logger.info('Application starting...');
    
    // Basic health check
    logger.info('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    });

  } catch (error) {
    logger.error('Application failed to start:', error);
    process.exit(1);
  }
}

main();