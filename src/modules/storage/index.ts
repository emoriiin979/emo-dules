import { createFileOperators as nodeCFO } from './concretes/node-storage.js';
import { createFileOperators as httpCFO } from './concretes/http-storage.js';
import type { FileOperators } from './types.js';

/**
 * ストレージ種別とオペレータ生成関数のマップ
 */
const storages = {
    node: nodeCFO,
    http: httpCFO,
} as const;

/**
 * ファイル操作オペレータを生成する
 * @param storageType - ストレージ種別
 * @param options - オプション
 * @returns ファイル操作オペレータ
 */
export function createFileOperators<K extends keyof typeof storages>(
    storageType: K,
    options?: Parameters<typeof storages[K]>[0],
): FileOperators {
    return storages[storageType](options ?? {});
}
