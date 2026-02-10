import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import type { BaseDbClient } from '../types.js';

/**
 * MySQL接続情報
 */
type ConnectionInfo = {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

/**
 * MySQL接続を生成する
 * @param connInfo - 接続情報
 * @returns DBクライアント
 */
export function createDbClient(
    connInfo: ConnectionInfo,
): MySql2Database & BaseDbClient {
    const pool = mysql.createPool({
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
