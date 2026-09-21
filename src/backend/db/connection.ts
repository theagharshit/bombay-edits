import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '../utils/logger';

let poolInstance: Pool | null = null;
let isConnectedCache: boolean | null = null;
const lastCheckTime = 0;

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

let inFlightCheckPromise: Promise<boolean> | null = null;

/**
 * Check if the PostgreSQL database is currently online and responding
 */
export async function isDatabaseConnected(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }

  // Once connected, trust the connection pool rather than querying SELECT 1
  if (isConnectedCache === true) {
    return true;
  }

  if (inFlightCheckPromise) {
    return inFlightCheckPromise;
  }

  inFlightCheckPromise = (async () => {
    try {
      const pool = getDbPool();
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        isConnectedCache = true;
        return true;
      } finally {
        client.release();
      }
    } catch {
      isConnectedCache = false;
      setTimeout(() => {
        isConnectedCache = null;
      }, 30000);
      return false;
    } finally {
      inFlightCheckPromise = null;
    }
  })();

  return inFlightCheckPromise;
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
