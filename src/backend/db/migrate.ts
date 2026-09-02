import fs from 'fs';
import path from 'path';
import { query, getDbPool } from './connection';
import { logger } from '../utils/logger';

export async function runMigrations() {
  logger.info('Running PostgreSQL database schema migrations...');

  try {
    const schemaPath = path.join(process.cwd(), 'src/backend/db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await query(sql);
    logger.info('✓ PostgreSQL schema migrations completed successfully.');
    return true;
  } catch (error) {
    logger.error('Failed to run database migrations', error);
    throw error;
  }
}

// Allow direct execution via tsx
if (process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      await getDbPool().end();
      process.exit(0);
    })
    .catch(async () => {
      await getDbPool().end();
      process.exit(1);
    });
}
