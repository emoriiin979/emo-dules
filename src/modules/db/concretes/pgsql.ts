import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { BaseDbClient } from '../types.js';

/**
 * PostgreSQL接続情報
 */
type ConnectionInfo = {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

/**
 * PostgreSQL接続を生成する
 * @param connInfo - 接続情報
 * @returns DBクライアント
 */
export function createDbClient(
    connInfo: ConnectionInfo,
): NodePgDatabase & BaseDbClient {
    const pool = new Pool({
        host: connInfo.host,
        port: connInfo.port,
        database: connInfo.database,
        user: connInfo.user,
        password: connInfo.password,
    });
    const db = drizzle(pool);
    return Object.assign(db, {
        async close() {
            await pool.end();
        },
    });
}
