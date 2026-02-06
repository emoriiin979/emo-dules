import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDbClient } from '../../src/modules/db/concretes/pgsql.js';
import { Pool } from 'pg';
import * as drizzlePg from 'drizzle-orm/node-postgres';

vi.mock('pg', () => {
    return {
        Pool: vi.fn().mockImplementation(function (this: any) {
            return {
                connect: vi.fn(),
                end: vi.fn(),
                query: vi.fn(),
            };
        }),
    };
});

vi.mock('drizzle-orm/node-postgres', () => ({
    drizzle: vi.fn(),
}));

describe('pgsql', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('接続情報が正しく pg.Pool コンストラクタに渡されること', () => {
        const connInfo = {
            host: 'localhost',
            port: 5432,
            database: 'pg_db',
            user: 'pg_user',
            password: 'pg_password',
        };

        const mockPoolInstance = {
            connect: vi.fn(),
            end: vi.fn(),
            query: vi.fn(),
        };

        vi.mocked(Pool).mockImplementation(function () {
            return mockPoolInstance as any;
        });

        vi.mocked(drizzlePg.drizzle).mockReturnValue({} as any);

        createDbClient(connInfo);

        expect(Pool).toHaveBeenCalledWith({
            host: connInfo.host,
            port: connInfo.port,
            database: connInfo.database,
            user: connInfo.user,
            password: connInfo.password,
        });

        expect(drizzlePg.drizzle).toHaveBeenCalledWith(mockPoolInstance);
    });

    it('drizzle関数の戻り値（DBクライアント）をそのまま返すこと', () => {
        const mockDb = { pgSpecificMethod: vi.fn() };
        vi.mocked(drizzlePg.drizzle).mockReturnValue(mockDb as any);

        const result = createDbClient({} as any);

        expect(result).toBe(mockDb);
    });
});