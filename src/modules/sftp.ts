import fs from 'fs/promises';
import path from 'path';
import * as ssh2 from 'ssh2';
import { createLogFuncs } from './log.js';
import { createFileOperators } from './storage/index.js';

/**
 * ログ関数
 */
const { logInfo } = createLogFuncs({ isDebug: true });

/**
 * ファイル読込関数
 */
const { readFile } = createFileOperators('node');

/**
 * Type: SFTP接続情報
 */
type SftpConnInfo = {
    host: string,
    username: string,
    password?: string,
    privateKeyPath?: string,
};

/**
 * Type: SFTPファイル
 */
type SftpFile = {
    filename: string,
    attrs: { size: number, mtime: number },
    longname: string,
};

/**
 * SFTP操作のための関数群を返す
 * @param connInfo - 接続情報
 * @returns SFTP操作関数群
 */
export async function createSftpFuncs(connInfo: SftpConnInfo): Promise<{
    getFile: (srcFilePath: string, dstDir: string, options?: { verbose?: boolean }) => Promise<void>,
    syncDir: (srcDir: string, dstDir: string, options?: { verbose?: boolean }) => Promise<void>,
    sftpClose: () => Promise<void>,
}> {
    const { privateKeyPath, ...restConnInfo } = connInfo;
    let privateKey: string;
    if (privateKeyPath) {
        try {
            privateKey = await readFile(privateKeyPath);
        } catch (err) {
            throw new Error(`Failed to read private key at ${privateKeyPath}: ${err}`);
        }
    }
    const conn = new ssh2.Client();
    return new Promise((resolve, reject) => {
        conn.on('error', (err) => {
            reject(err);
        });
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                if (err) return reject(err);
                resolve({
                    getFile: async (srcFilePath: string, dstDir: string, options?: { verbose?: boolean }) => {
                        await concreteGetFile(sftp, srcFilePath, dstDir, options?.verbose ?? false);
                    },
                    syncDir: async (srcDir: string, dstDir: string, options?: { verbose?: boolean }) => {
                        await concreteSyncDir(sftp, srcDir, dstDir, options?.verbose ?? false);
                    },
                    sftpClose: async () => {
                        conn.end();
                    },
                });
            });
        });
        conn.connect({
            ...restConnInfo,
            ...(privateKey ? { privateKey } : {}),
        });
    });
}

/**
 * ファイル取得
 * @internal
 * @param sftp - SFTPクライアント
 * @param srcFilePath - 取得したいファイルのパス
 * @param dstDir - 取得先ディレクトリ
 * @param verbose - 詳細ログを書き出すかどうか
 */
async function concreteGetFile(
    sftp: ssh2.SFTPWrapper,
    srcFilePath: string,
    dstDir: string,
    verbose: boolean,
): Promise<void> {
    await fs.mkdir(dstDir, { recursive: true });
    const fileName = path.basename(srcFilePath);
    const dstFilePath = path.join(dstDir, fileName);
    await new Promise<void>((resolve, reject) => {
        sftp.fastGet(
            srcFilePath,
            dstFilePath,
            (err: any) => (err ? reject(err) : resolve()),
        );
    });
    if (verbose) logInfo(`COPY: ${srcFilePath} -> ${dstFilePath}`);
}

/**
 * ディレクトリ同期処理
 * @internal
 * @param sftp - SFTPクライアント
 * @param srcDir - コピー元ディレクトリ
 * @param dstDir - コピー先ディレクトリ
 * @param verbose - 詳細ログを書き出すかどうか
 */
async function concreteSyncDir(
    sftp: ssh2.SFTPWrapper,
    srcDir: string,
    dstDir: string,
    verbose: boolean,
): Promise<void> {
    await fs.mkdir(dstDir, { recursive: true });
    const srcFiles = await new Promise((resolve, reject) => {
        sftp.readdir(
            srcDir,
            (err: unknown, list: SftpFile[]) => (err ? reject(err) : resolve(list)),
        );
    }) as SftpFile[];
    for (const srcFile of srcFiles) {
        const srcFilePath = path.join(srcDir, srcFile.filename);
        const dstFilePath = path.join(dstDir, srcFile.filename);
        if (srcFile.longname[0] === 'd') {
            // ディレクトリの場合
            await concreteSyncDir(sftp, srcFilePath, dstFilePath, verbose);
        } else {
            // ファイルの場合
            if (await shouldDownload(srcFile, dstFilePath)) {
                await new Promise<void>((resolve, reject) => {
                    sftp.fastGet(
                        srcFilePath,
                        dstFilePath,
                        (err: any) => (err ? reject(err) : resolve()),
                    );
                });
                if (verbose) logInfo(`COPY: ${srcFilePath} -> ${dstFilePath}`);
            }
        }
    }
}

/**
 * ダウンロード対象かどうか
 * - サイズまたは更新日時を比較する。
 * @internal
 * @param srcFile - コピー元ファイル
 * @param dstFilePath - コピー先ファイルパス
 * @returns ダウンロード対象の場合は true
 */
async function shouldDownload(
    srcFile: SftpFile,
    dstFilePath: string,
): Promise<boolean> {
    try {
        const dstStat = await fs.stat(dstFilePath);
        // サイズが違う、またはコピー元の方が更新日時が新しい場合は true
        return srcFile.attrs.size !== dstStat.size || (srcFile.attrs.mtime * 1000) > dstStat.mtimeMs;
    } catch (error) {
        // ローカルにファイルが存在しない場合なので必ずダウンロード
        return true;
    }
}
