import { httpFetch } from '../../http.js';
import { mergeUrl } from '../../url.js';
import type { FileOperators } from '../types.js';

/**
 * ファイルを全て読み込む
 * @param filePath - ファイルの場所
 * @returns ファイルの中身（文字データ）
 */
export async function readFile(filePath: string): Promise<string> {
    const res = await httpFetch({ method: 'GET', url: filePath });
    if (!res.ok) {
        throw new Error(`Failed to read file: ${res.status}`);
    }
    return res.text();
}

/**
 * ファイルを1行ずつ読む
 * - HTTP はストリーム前提。サーバーが chunked transfer を
 *   サポートしている必要あり。
 * @param filePath - ファイルの場所
 * @returns 1行ずつ読み込むジェネレータ
 */
export async function* readLines(filePath: string): AsyncGenerator<string> {
    const res = await httpFetch({ method: 'GET', url: filePath });
    if (!res.ok || !res.body) {
        throw new Error(`Failed to read file: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
            yield line.replace(/\r$/, '');
        }
    }
    if (buffer.length > 0) {
        yield buffer;
    }
}

/**
 * ファイルに書き込む
 * @param filePath - ファイルの場所
 * @param message - 書き込む文字
 */
export async function writeFile(filePath: string, message: string): Promise<void> {
    const res = await httpFetch({ method: 'PUT', url: filePath, body: { content: message } });
    if (!res.ok) {
        throw new Error(`Failed to write file: ${res.status}`);
    }
}

/**
 * ファイルに追記する
 * @param filePath - ファイルの場所
 * @param message - 書き込む文字
 */
export async function appendFile(filePath: string, message: string): Promise<void> {
    const res = await httpFetch({ method: 'POST', url: filePath, body: { content: message } });
    if (!res.ok) {
        throw new Error(`Failed to append file: ${res.status}`);
    }
}

/**
 * ファイルを削除する
 * @param filePath - ファイルの場所
 */
export async function deleteFile(filePath: string): Promise<void> {
    const res = await httpFetch({ method: 'DELETE', url: filePath });
    if (!res.ok) {
        throw new Error(`Failed to delete file: ${res.status}`);
    }
}

/**
 * 各種ファイル操作関数を生成する
 * @param options - オプション（baseUrl: ベース URL）
 * @returns ファイル操作関数群
 */
export function createFileOperators(options: { baseUrl?: string }): FileOperators {
    const baseUrl = options.baseUrl ?? '';
    const resolveUrl = (path: string) => mergeUrl(baseUrl, path);
    return {
        readFile: (path) => readFile(resolveUrl(path)),
        readLines: (path) => readLines(resolveUrl(path)),
        writeFile: (path, content) => writeFile(resolveUrl(path), content),
        appendFile: (path, content) => appendFile(resolveUrl(path), content),
        deleteFile: (path) => deleteFile(resolveUrl(path)),
    };
}
