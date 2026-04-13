const mysql = require('mysql2/promise');
import { config } from '../config';
import type { Pool, PoolConnection } from 'mysql2/promise';

/** Loose typing matches prior createConnection behavior for callers */
type QueryResult = any;

const poolOptions = {
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

const mainPool: Pool = mysql.createPool({
  ...config.db,
  ...poolOptions,
});

const durangPool: Pool = mysql.createPool({
  ...config.dbDurangeneidad,
  ...poolOptions,
});

export module db {
  export async function query(sql: any, params?: any): Promise<QueryResult> {
    try {
      const [results] = await mainPool.execute(sql, params);
      return results as QueryResult;
    } catch (error) {
      console.log(error);
    }
  }

  /** Pooled connection for transactions — always release() in finally */
  export async function connection(): Promise<PoolConnection> {
    return mainPool.getConnection();
  }
}

export module dbDurangeneidad {
  export async function query(sql: any, params?: any): Promise<QueryResult> {
    try {
      const [results] = await durangPool.execute(sql, params);
      return results as QueryResult;
    } catch (error) {
      console.log(error);
    }
  }

  export async function connection(): Promise<PoolConnection> {
    return durangPool.getConnection();
  }
}
