import { describe, it, expect, vi, beforeEach, expectTypeOf } from 'vitest';
import { createDbClient, transaction } from '../../src/modules/db/index.js';
import * as mysqlImpl from '../../src/modules/db/concretes/mysql.js';
import * as pgsqlImpl from '../../src/modules/db/concretes/pgsql.js';

// 具象実装をモック化する
vi.mock('../../src/modules/db/concretes/mysql.js', () => ({
    createDbClient: vi.fn(),
}));
vi.mock('../../src/modules/db/concretes/pgsql.js', () => ({
    createDbClient: vi.fn(),
}));

describe('db-index', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createDbClient', () => {
        it('mysqlを指定したときにmysql用の生成関数が呼ばれること', () => {
            const mockOptions = { host: 'localhost', user: 'root' };
            const mockDb = { someMysqlMethods: vi.fn() };
            vi.mocked(mysqlImpl.createDbClient).mockReturnValue(mockDb as any);

            const result = createDbClient('mysql', mockOptions as any);

            expect(mysqlImpl.createDbClient).toHaveBeenCalledWith(mockOptions);
            expect(result).toBe(mockDb);
        });

        it('pgsqlを指定したときにpgsql用の生成関数が呼ばれること', () => {
            const mockOptions = { connectionString: 'postgres://...' };
            const mockDb = { somePgMethods: vi.fn() };
            vi.mocked(pgsqlImpl.createDbClient).mockReturnValue(mockDb as any);

            const result = createDbClient('pgsql', mockOptions as any);

            expect(pgsqlImpl.createDbClient).toHaveBeenCalledWith(mockOptions);
            expect(result).toBe(mockDb);
        });
    });

    describe('transaction', () => {
        it('pgsqlクライアントを渡したとき、txがPgTransaction型であること', async () => {
            type ExpectedPgTx = Parameters<Parameters<ReturnType<typeof pgsqlImpl.createDbClient>['transaction']>[0]>[0];
            const mockPgDb = {
                transaction: vi.fn().mockImplementation(async (cb) => {
                    return await cb({} as any);
                })
            } as unknown as ReturnType<typeof createDbClient<'pgsql'>>;

            await transaction(mockPgDb, async (tx) => {
                expectTypeOf(tx).toEqualTypeOf<ExpectedPgTx>();
                return 'ok';
            });
        });
        it('mysqlクライアントを渡したとき、txがMySqlTransaction型であること', async () => {
            type ExpectedMysqlTx = Parameters<Parameters<ReturnType<typeof mysqlImpl.createDbClient>['transaction']>[0]>[0];
            const mockMysqlDb = {
                transaction: vi.fn().mockImplementation(async (cb) => {
                    return await cb({} as any);
                })
            } as unknown as ReturnType<typeof createDbClient<'mysql'>>;

            await transaction(mockMysqlDb, async (tx) => {
                expectTypeOf(tx).toEqualTypeOf<ExpectedMysqlTx>();
                return 'ok';
            });
        });
    });
});
