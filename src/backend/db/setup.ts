import { runMigrations } from './migrate';
import { runSeed } from './seed';
import { getDbPool } from './connection';
import { logger } from '../utils/logger';

export async function setupDatabase() {
  logger.info('=============================================');
  logger.info('Starting PostgreSQL Database Setup');
  logger.info('=============================================');

  try {
    await runMigrations();
    await runSeed();
    logger.info('=============================================');
    logger.info('✓ PostgreSQL Database Setup Complete!');
    logger.info('=============================================');
  } catch (error) {
    logger.error('Database setup failed', error);
    throw error;
  }
}

if (process.argv[1]?.endsWith('setup.ts')) {
  setupDatabase()
    .then(async () => {
      await getDbPool().end();
      process.exit(0);
    })
    .catch(async () => {
      await getDbPool().end();
      process.exit(1);
    });
}
