import { createDbClient as createMysqlClient } from './concretes/mysql.js';
import { createDbClient as createPgsqlClient } from './concretes/pgsql.js';

/**
 * DB種別とDBクライアント生成関数のマップ
 */
const dbClients = {
    mysql: createMysqlClient,
    pgsql: createPgsqlClient,
} as const;

/**
 * DBクライアントを生成する
 * @param dbType - DB種別
 * @param options - DBクライアント生成オプション
 * @returns DBクライアント
 */
export function createDbClient<
    K extends keyof typeof dbClients
>(
    dbType: K,
    options: Parameters<typeof dbClients[K]>[0],
): ReturnType<typeof dbClients[K]> {
    return dbClients[dbType](options) as ReturnType<typeof dbClients[K]>;
}

/**
 * トランザクションを開始して処理を実行する
 * @param db - DBクライアント
 * @param fn - 実行する処理
 * @returns 
 */
export async function transaction<
    T extends ReturnType<typeof dbClients[keyof typeof dbClients]>,
    R
>(
    db: T,
    fn: (tx: Parameters<Parameters<T['transaction']>[0]>[0]) => Promise<R>,
): Promise<R> {
    return await db.transaction(fn);
}
