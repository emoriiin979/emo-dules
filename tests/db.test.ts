import { sql, count } from 'drizzle-orm';
import { mysqlTable, serial as serialMysql, varchar } from 'drizzle-orm/mysql-core';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import { drizzle as drizzlePgsql } from 'drizzle-orm/node-postgres';
import { pgTable, serial as serialPgsql, text } from 'drizzle-orm/pg-core';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createDbClient, transaction } from '../src/modules/db';

const required = (value: string | undefined | null): string => {
    if (typeof value !== 'string' || value === '') {
        throw new Error('The provided value is empty or not a string');
    }
    return value;
}

const mysqlConnInfo = {
    host: required(process.env.MYSQL_HOST),
    port: parseInt(required(process.env.MYSQL_PORT)),
    user: required(process.env.MYSQL_USER),
    password: required(process.env.MYSQL_PASSWORD),
    database: required(process.env.MYSQL_DATABASE),
};

const pgsqlConnInfo = {
    host: required(process.env.POSTGRES_HOST),
    port: parseInt(required(process.env.POSTGRES_PORT)),
    user: required(process.env.POSTGRES_USER),
    password: required(process.env.POSTGRES_PASSWORD),
    database: required(process.env.POSTGRES_DB),
};

describe('db - mysql', async () => {
    // テスト用テーブルのスキーマ
    const userSchema = mysqlTable('users', {
        id: serialMysql('id').primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
    });

    // 検証用のdrizzle DBクライアント
    const pool = mysql.createPool(mysqlConnInfo);
    const ddb = drizzleMysql(pool);

    beforeAll(async () => {
        await ddb.execute(sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB
        `);
    });

    afterAll(async () => {
        await ddb.execute(sql`
            DROP TABLE IF EXISTS users
        `);
        await pool.end();
    });

    beforeEach(async () => {
        await ddb.execute(sql`
            TRUNCATE TABLE users
        `);
    });

    describe('createDbClient & transaction', async () => {
        it('DB変更が正しくコミットされること', async () => {
            const db = createDbClient('mysql', mysqlConnInfo);
            await transaction(db, async (tx) => {
                await tx.insert(userSchema).values({ name: 'test11' });
                await tx.insert(userSchema).values({ name: 'test12' });
            });
            await db.close();
            const result = await ddb.select({ count: count() }).from(userSchema);
            expect(result[0].count).toBe(2);
        });
        it('エラーが起きた場合はロールバックされること', async () => {
            const db = createDbClient('mysql', mysqlConnInfo);
            try {
                await transaction(db, async (tx) => {
                    await tx.insert(userSchema).values({ name: 'test21' });
                    await tx.insert(userSchema).values({ name: 'test22' });
                    throw new Error('Rollback Test');
                });
            } catch (e) {
                // error expected
            }
            await db.close();
            const result = await ddb.select({ count: count() }).from(userSchema);
            expect(result[0].count).toBe(0);
        });
    });
});

describe('db - pgsql', async () => {
    // テスト用テーブルのスキーマ
    const userSchema = pgTable('users', {
        id: serialPgsql('id').primaryKey(),
        name: text('name').notNull(),
    });

    // 検証用のdrizzle DBクライアント
    const pool = new pg.Pool(pgsqlConnInfo);
    const ddb = drizzlePgsql(pool);

    beforeAll(async () => {
        await ddb.execute(sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            )
        `);
    });

    afterAll(async () => {
        await ddb.execute(sql`
            DROP TABLE IF EXISTS users
        `);
        await pool.end();
    });

    beforeEach(async () => {
        await ddb.execute(sql`
            TRUNCATE TABLE users
        `);
    });

    describe('createDbClient', async () => {
        it('DB変更が正しくコミットされること', async () => {
            const db = createDbClient('pgsql', pgsqlConnInfo);
            await transaction(db, async (tx) => {
                await tx.insert(userSchema).values({ name: 'test11' });
                await tx.insert(userSchema).values({ name: 'test12' });
            });
            await db.close();
            const result = await ddb.select({ count: count() }).from(userSchema);
            expect(result[0].count).toBe(2);
        });
        it('エラーが起きた場合はロールバックされること', async () => {
            const db = createDbClient('pgsql', pgsqlConnInfo);
            try {
                await transaction(db, async (tx) => {
                    await tx.insert(userSchema).values({ name: 'test21' });
                    await tx.insert(userSchema).values({ name: 'test22' });
                    throw new Error('Rollback Test');
                });
            } catch (e) {
                // error expected
            }
            await db.close();
            const result = await ddb.select({ count: count() }).from(userSchema);
            expect(result[0].count).toBe(0);
        });
    });
});
