import fs from 'fs';
import { resolve } from 'path';
import readline from 'readline';
import type { FileOperators } from '../types.js';

/**
 * ファイルを全て読み込む
 * @param filePath - ファイルの場所
 * @returns ファイルの中身（文字データ）
 */
export async function readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf8');
}

/**
 * ファイルを1行ずつ読む
 * @param filePath - ファイルの場所
 * @returns 1行ずつ読み込むジェネレータ
 */
export async function* readLines(filePath: string): AsyncGenerator<string> {
    const fileStream = fs.createReadStream(filePath, {
        encoding: 'utf8',
    });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    try {
        for await (const line of rl) {
            yield line;
        }
    } finally {
        rl.close();
        fileStream.close();
    }
}

/**
 * ファイルに書き込む
 * @param filePath - ファイルの場所
 * @param message - 書き込む文字
 */
export async function writeFile(filePath: string, message: string): Promise<void> {
    return fs.promises.writeFile(filePath, message, 'utf8');
}

/**
 * ファイルに追記する
 * @param filePath - ファイルの場所
 * @param message - 書き込む文字
 */
export async function appendFile(filePath: string, message: string): Promise<void> {
    return fs.promises.appendFile(filePath, message, 'utf8');
}

/**
 * ファイルを削除する
 * @param filePath - ファイルの場所
 */
export async function deleteFile(filePath: string): Promise<void> {
    return fs.promises.unlink(filePath);
}

/**
 * 各種ファイル操作関数を生成する
 * @param options - オプション（baseDir: ベースディレクトリ）
 * @returns ファイル操作関数群
 */
export function createFileOperators(options: { baseDir?: string }): FileOperators {
    const { baseDir } = options;
    const resolvePath = (path: string) => resolve(baseDir ?? '', path);
    return {
        readFile: (path) => readFile(resolvePath(path)),
        readLines: (path) => readLines(resolvePath(path)),
        writeFile: (path, content) => writeFile(resolvePath(path), content),
        appendFile: (path, content) => appendFile(resolvePath(path), content),
        deleteFile: (path) => deleteFile(resolvePath(path)),
    };
}
