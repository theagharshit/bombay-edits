import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '../utils/logger';

let poolInstance: Pool | null = null;
let isConnectedCache: boolean | null = null;
let lastCheckTime = 0;

export function getDbPool(): Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const connectionString = process.env.DATABASE_URL;

  const config = connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'bombay_edits',
      };

  poolInstance = new Pool({
    ...config,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

  poolInstance.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client pool', err);
    isConnectedCache = false;
  });

  return poolInstance;
}

/**
 * Check if the PostgreSQL database is currently online and responding
 */
export async function isDatabaseConnected(): Promise<boolean> {
  const now = Date.now();
  // Cache connection status for 5 seconds to avoid spamming ping queries
  if (isConnectedCache !== null && now - lastCheckTime < 5000) {
    return isConnectedCache;
  }

  try {
    const pool = getDbPool();
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      isConnectedCache = true;
      lastCheckTime = now;
      return true;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    isConnectedCache = false;
    lastCheckTime = now;
    return false;
  }
}

/**
 * Execute a parameterized SQL query
 */
export async function query<R extends QueryResultRow = QueryResultRow>(
  sqlText: string,
  params: unknown[] = []
): Promise<QueryResult<R>> {
  const start = performance.now();
  const pool = getDbPool();

  try {
    const result = await pool.query<R>(sqlText, params);
    const duration = Math.round(performance.now() - start);

    logger.debug(`[SQL] Executed query in ${duration}ms`, {
      rows: result.rowCount,
      sql: sqlText.replace(/\s+/g, ' ').trim().slice(0, 120),
    });

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    logger.error(`[SQL] Query failed after ${duration}ms: ${sqlText}`, error);
    throw error;
  }
}

/**
 * Execute operations within a database transaction
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('[SQL] Transaction rolled back due to error', error);
    throw error;
  } finally {
    client.release();
  }
}
