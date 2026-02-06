import * as drizzleMysql from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDbClient } from '../../src/modules/db/concretes/mysql.js';

vi.mock('mysql2/promise', () => ({
    default: {
        createPool: vi.fn(),
    },
}));

vi.mock('drizzle-orm/mysql2', () => ({
    drizzle: vi.fn(),
}));

describe('mysql', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('接続情報が正しく mysql2.createPool に渡されること', () => {
        const connInfo = {
            host: 'localhost',
            port: 3306,
            database: 'test_db',
            user: 'user',
            password: 'password',
        };

        const mockPool = { end: vi.fn() };
        vi.mocked(mysql.createPool).mockReturnValue(mockPool as any);
        vi.mocked(drizzleMysql.drizzle).mockReturnValue({} as any);

        createDbClient(connInfo);

        expect(mysql.createPool).toHaveBeenCalledWith({
            host: connInfo.host,
            port: connInfo.port,
            database: connInfo.database,
            user: connInfo.user,
            password: connInfo.password,
        });

        expect(drizzleMysql.drizzle).toHaveBeenCalledWith(mockPool);
    });

    it('drizzle関数の戻り値（DBクライアント）をそのまま返すこと', () => {
        const mockDb = { query: vi.fn() };
        vi.mocked(drizzleMysql.drizzle).mockReturnValue(mockDb as any);

        const result = createDbClient({} as any);

        expect(result).toBe(mockDb);
    });
});
