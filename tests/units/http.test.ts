import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { httpFetch } from '../../src/modules/http';

global.fetch = vi.fn();

describe('httpFetch', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        {
            method: 'GET',
            expected: {
                method: 'GET',
                headers: {},
            },
        },
        {
            method: 'POST',
            expected: {
                method: 'POST',
                headers: {},
            },
        },
        {
            method: 'PUT',
            expected: {
                method: 'PUT',
                headers: {},
            },
        },
        {
            method: 'DELETE',
            expected: {
                method: 'DELETE',
                headers: {},
            },
        },
    ])('各メソッドでリクエストを実行する', async ({ method, expected }) => {
        const mockResponse = { ok: true, json: async () => ({}) };
        (global.fetch as Mock).mockResolvedValue(mockResponse);

        await httpFetch({
            method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
            url: 'https://api.example.com/test',
        });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.example.com/test',
            expect.objectContaining({
                method: expected.method,
                headers: expected.headers,
            }),
        );
    });

    it('指定した URL が送信される', async () => {
        const mockResponse = { ok: true };
        (global.fetch as Mock).mockResolvedValue(mockResponse);

        await httpFetch({
            method: 'GET',
            url: 'https://api.example.com/test',
        });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.example.com/test',
            expect.objectContaining({
                method: 'GET',
                headers: {},
            }),
        );
    });

    it('指定したヘッダーが送信される', async () => {
        const mockResponse = { ok: true };
        (global.fetch as Mock).mockResolvedValue(mockResponse);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
        };
        await httpFetch({
            method: 'POST',
            url: 'https://api.example.com/post',
            headers,
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                headers,
            }),
        );
    });

    it('データを JSON 文字列化して body に設定する', async () => {
        const mockResponse = { ok: true };
        (global.fetch as Mock).mockResolvedValue(mockResponse);

        const data = { id: 1, name: 'Test' };
        await httpFetch({
            method: 'POST',
            url: 'https://api.example.com/users',
            body: data,
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(data),
            }),
        );
    });

    describe('オプションが正しく適用される', async () => {
        it('タイムアウトを正しく処理する', async () => {
            vi.useFakeTimers();
            const mockResponse = { ok: true };
            const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
            (global.fetch as Mock).mockResolvedValue(mockResponse);

            const requestPromise = httpFetch({
                method: 'GET',
                url: 'https://example.com',
                options: { timeoutSec: 5 },
            });

            vi.advanceTimersByTime(5000);

            await requestPromise;

            expect(abortSpy).toHaveBeenCalled();
            vi.useRealTimers();
        });

        it('httpErrorsがtrueでレスポンスがokでない場合エラーをスローする', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                statusText: 'Not Found',
            };
            (global.fetch as Mock).mockResolvedValue(mockResponse);

            await expect(httpFetch({
                method: 'GET',
                url: 'https://example.com/missing',
                options: { httpErrors: true },
            })).rejects.toThrow('[404] Not Found');
        });
    });
});
