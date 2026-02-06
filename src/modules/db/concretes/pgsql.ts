import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

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
export function createDbClient(connInfo: ConnectionInfo): NodePgDatabase {
    const pool = new Pool({
        host: connInfo.host,
        port: connInfo.port,
        database: connInfo.database,
        user: connInfo.user,
        password: connInfo.password,
    });
    return drizzle(pool);
}
