import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { createLogFuncs, createLoggerMiddleware } from '../src/modules/log';

/**
 * JSON行のみを抽出してパースするためのヘルパー
 */
const parseLastJson = (data: string) => {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const jsonLine = lines.reverse().find(line => line.trim().startsWith('{'));
    if (!jsonLine) throw new Error('JSON output not found');
    return JSON.parse(jsonLine);
};

describe('log', () => {
    let stdoutData = '';
    let originalWrite: typeof process.stdout.write;

    beforeEach(() => {
        stdoutData = '';
        originalWrite = process.stdout.write;

        (process.stdout.write as any) = (chunk: string | Uint8Array): boolean => {
            stdoutData += chunk.toString();
            return true;
        };
    });

    afterEach(() => {
        process.stdout.write = originalWrite;
    });

    describe('createLogFuncs', () => {
        it('INFO ログが正しい形式で標準出力に書き出されること', () => {
            const { logInfo } = createLogFuncs();

            logInfo('test-message', { userId: 123 });

            const parsed = parseLastJson(stdoutData);
            expect(parsed.message).toBe('test-message');
            expect(parsed.level).toBe('INFO');
            expect(parsed.userId).toBe(123);
        });

        it('ERROR ログが正しい形式で標準出力に書き出されること', () => {
            const { logError } = createLogFuncs();
            const error = new Error('boom');

            logError('error-occurred', { err: error, code: 500 });

            const parsed = parseLastJson(stdoutData);
            expect(parsed.message).toBe('error-occurred');
            expect(parsed.level).toBe('ERROR');
            expect(parsed.code).toBe(500);
            expect(parsed.err.message).toBe('boom');
            expect(parsed.err.stack).toBeDefined();
        });
    });

    describe('createLoggerMiddleware', () => {
        it('Hono経由のリクエストで、標準出力にアクセスログが書き出されること', async () => {
            const app = new Hono();
            app.use('*', createLoggerMiddleware());
            app.get('/test', (c) => c.text('ok'));

            await app.request('/test');

            const parsed = parseLastJson(stdoutData);
            expect(parsed.level).toBe('INFO');
            expect(parsed.message).toMatch(/GET \/test/);
        });
    });
});
