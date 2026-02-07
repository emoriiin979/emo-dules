
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    readFile,
    readLines,
    writeFile,
    appendFile,
    deleteFile,
    createFileOperators
} from '../../../src/modules/storage/concretes/http-storage';
import * as httpModule from '../../../src/modules/http';

// モックの作成
vi.mock('../../../src/modules/http', () => ({
    httpFetch: vi.fn(),
}));

describe('storage-http', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('readFile', () => {
        it('レスポンスが正常な場合、テキストを返す', async () => {
            const mockText = 'content';
            const mockRes = {
                ok: true,
                text: vi.fn().mockResolvedValue(mockText),
            };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            const result = await readFile('https://example.com/file.txt');
            expect(result).toBe(mockText);
            expect(httpModule.httpFetch).toHaveBeenCalledWith({
                method: 'GET',
                url: 'https://example.com/file.txt',
            });
        });

        it('レスポンスがエラーの場合、例外を投げる', async () => {
            const mockRes = {
                ok: false,
                status: 404,
            };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await expect(readFile('https://example.com/file.txt'))
                .rejects
                .toThrow('Failed to read file: 404');
        });
    });

    describe('readLines', () => {
        it('ストリームから行を順次読み込む', async () => {
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode('line1\nline2'));
                    controller.enqueue(new TextEncoder().encode('\nline3'));
                    controller.close();
                }
            });
            const mockRes = {
                ok: true,
                body: stream,
            };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            const result = [];
            for await (const line of readLines('https://example.com/file.txt')) {
                result.push(line);
            }

            expect(result).toEqual(['line1', 'line2', 'line3']);
        });

        it('レスポンスがエラーの場合、例外を投げる', async () => {
            const mockRes = {
                ok: false,
                status: 500,
            };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            const generator = readLines('https://example.com/file.txt');
            await expect(generator.next())
                .rejects
                .toThrow('Failed to read file: 500');
        });

        it('レスポンスボディがない場合、例外を投げる', async () => {
            const mockRes = {
                ok: true,
                body: null,
                status: 200
            };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            const generator = readLines('https://example.com/file.txt');
            await expect(generator.next())
                .rejects
                .toThrow('Failed to read file: 200');
        });
    });

    describe('writeFile', () => {
        it('コンテンツを含むPUTリクエストを送信する', async () => {
            const mockRes = { ok: true };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await writeFile('https://example.com/file.txt', 'content');

            expect(httpModule.httpFetch).toHaveBeenCalledWith({
                method: 'PUT',
                url: 'https://example.com/file.txt',
                body: { content: 'content' },
            });
        });

        it('レスポンスがエラーの場合、例外を投げる', async () => {
            const mockRes = { ok: false, status: 403 };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await expect(writeFile('https://example.com/file.txt', 'content'))
                .rejects
                .toThrow('Failed to write file: 403');
        });
    });

    describe('appendFile', () => {
        it('コンテンツを含むPOSTリクエストを送信する', async () => {
            const mockRes = { ok: true };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await appendFile('https://example.com/file.txt', 'more content');

            expect(httpModule.httpFetch).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://example.com/file.txt',
                body: { content: 'more content' },
            });
        });

        it('レスポンスがエラーの場合、例外を投げる', async () => {
            const mockRes = { ok: false, status: 500 };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await expect(appendFile('https://example.com/file.txt', 'content'))
                .rejects
                .toThrow('Failed to append file: 500');
        });
    });

    describe('deleteFile', () => {
        it('DELETEリクエストを送信する', async () => {
            const mockRes = { ok: true };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await deleteFile('https://example.com/file.txt');

            expect(httpModule.httpFetch).toHaveBeenCalledWith({
                method: 'DELETE',
                url: 'https://example.com/file.txt',
            });
        });

        it('レスポンスがエラーの場合、例外を投げる', async () => {
            const mockRes = { ok: false, status: 404 };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await expect(deleteFile('https://example.com/file.txt'))
                .rejects
                .toThrow('Failed to delete file: 404');
        });
    });

    describe('createFileOperators', () => {
        it('baseUrlが解決された状態でオペレーターを作成する', async () => {
            const operators = createFileOperators({ baseUrl: 'https://api.example.com/' });

            const mockRes = { ok: true, text: vi.fn().mockResolvedValue('data') };
            vi.mocked(httpModule.httpFetch).mockResolvedValue(mockRes as any);

            await operators.readFile('data.txt');

            expect(httpModule.httpFetch).toHaveBeenCalledWith({
                method: 'GET',
                url: 'https://api.example.com/data.txt',
            });
        });
    });
});
