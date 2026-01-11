import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
    type Mock
} from 'vitest';
import { Client } from '../../src/Http/Client';

global.fetch = vi.fn();

describe('Client', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('constructor', () => {
        it('デフォルト設定が適用されること', () => {
            // arrange
            const client = new Client({});

            // act
            const config = (client as any)._config;

            // assert
            expect(config.baseUrl).toBe('');
            expect(config.headers).toEqual({});
            expect(config.httpErrors).toBe(true);
            expect(config.timeoutSec).toBe(10);
        });

        it('設定が上書きされること', () => {
            // arrange
            const customClient = new Client({
                baseUrl: 'https://api.example.com',
                headers: { 'X-Custom': 'value' },
                httpErrors: false,
                timeoutSec: 5,
            });

            // act
            const config = (customClient as any)._config;

            // assert
            expect(config.baseUrl).toBe('https://api.example.com');
            expect(config.headers).toEqual({ 'X-Custom': 'value' });
            expect(config.httpErrors).toBe(false);
            expect(config.timeoutSec).toBe(5);
        });
    });

    describe('get', () => {
        it('絶対URLでリクエストされること', async () => {
            // arrange
            const client = new Client({});
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.get('https://example.com/api/test');

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/test',
                }),
                expect.objectContaining({
                    method: 'GET',
                }),
            );
        });

        it('相対URLでリクエストされること', async () => {
            // arrange
            const client = new Client({ baseUrl: 'https://api.example.com' });
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.get('/users');

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://api.example.com/users',
                }),
                expect.objectContaining({
                    method: 'GET',
                }),
            );
        });

        it('パラメータがクエリ文字列として追加されること', async () => {
            // arrange
            const client = new Client({});
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.get(
                'https://example.com/api/search',
                { q: 'keyword', page: 1 },
            );

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/search?q=keyword&page=1',
                }),
                expect.anything(),
            );
        });

        it('既存のクエリ文字列がある場合、&で追加されること', async () => {
            // arrange
            const client = new Client({});
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.get(
                'https://example.com/api/search?sort=desc',
                { page: 2 },
            );

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/search?sort=desc&page=2',
                }),
                expect.anything(),
            );
        });

        it('undefinedやnullのパラメータは除外されること', async () => {
            // arrange
            const client = new Client({});
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.get(
                'https://example.com/api/test',
                { a: 1, b: undefined, c: null },
            );

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/test?a=1',
                }),
                expect.anything()
            );
        });

        it('リクエスト設定が上書きされること', async () => {
            // arrange
            const client = new Client({
                headers: { 'X-Common': 'common' },
            });
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.get(
                'https://example.com/api/test',
                undefined,
                { headers: { 'X-Override': 'override' } },
            );

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/test',
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Override': 'override',
                    }),
                }),
            );
        });
    });

    describe('post', () => {
        it('正しいURL、メソッド、データでリクエストすること', async () => {
            // arrange
            const data = { name: 'test' };
            const client = new Client({});
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.post('https://example.com/api/create', data);

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/create',
                }),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('Content-Typeが既に指定されている場合は上書きしないこと', async () => {
            // arrange
            const client = new Client({
                headers: { 'content-type': 'application/custom' },
            });
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.post(
                'https://example.com/api/create',
                { name: 'test' },
            );

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/create',
                }),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ name: 'test' }),
                    headers: expect.objectContaining({
                        'content-type': 'application/custom',
                    }),
                }),
            );
        });

        it('リクエスト設定が上書きされること', async () => {
            // arrange
            const client = new Client({
                headers: { 'X-Common': 'common' },
            });
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                status: 200,
            });

            // act
            await client.post(
                'https://example.com/api/create',
                {},
                { headers: { 'X-Override': 'override' } },
            );

            // assert
            expect(global.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: 'https://example.com/api/create',
                }),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({}),
                    headers: expect.objectContaining({
                        'X-Override': 'override',
                        'Content-Type': 'application/json',
                    }),
                }),
            );
        });
    });

    describe('エラーハンドリング', () => {
        it('httpErrorsがtrueのとき、HTTPエラーで例外をスローすること', async () => {
            // arrange
            const client = new Client({});
            (global.fetch as Mock).mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            // act & assert
            await expect(client.get('https://example.com/404'))
                .rejects
                .toThrow('[404] Not Found (https://example.com/404)');
        });

        it('httpErrorsがfalseのとき、HTTPエラーでも例外をスローしないこと', async () => {
            // arrange
            const client = new Client({ httpErrors: false });
            (global.fetch as Mock).mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            // act & assert
            await expect(client.get('https://example.com/500'))
                .resolves
                .not
                .toThrow();
        });

        it('タイムアウト時にリクエストが中断されること', async () => {
            // arrange
            vi.useFakeTimers();
            const client = new Client({ timeoutSec: 1 });
            (global.fetch as Mock).mockImplementation(async (url, options) => {
                if (options.signal?.aborted) {
                    throw new DOMException('Aborted', 'AbortError');
                }
                return new Promise((_, reject) => {
                    options.signal?.addEventListener('abort', () => {
                        reject(new DOMException('Aborted', 'AbortError'));
                    });
                });
            });

            // act
            const p = client.get('https://example.com');
            vi.advanceTimersByTime(2000);

            // assert
            await expect(p).rejects.toThrow('Aborted');
        });
    });
});
