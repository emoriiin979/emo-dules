import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { createSftpFuncs } from '../src/modules/sftp';

const required = (value: string | undefined | null): string => {
    if (typeof value !== 'string' || value === '') {
        throw new Error('The provided value is empty or not a string');
    }
    return value;
}

const sftpConnInfo = {
    host: required(process.env.SFTP_HOST),
    port: parseInt(required(process.env.SFTP_PORT || '2222')),
    username: required(process.env.SFTP_USER),
    password: required(process.env.SFTP_PASSWORD),
};

describe('SFTP Integration Tests', () => {
    const LOCAL_DEST = path.join(os.tmpdir(), 'sftp-test-out');
    const REMOTE_ROOT = '/upload';

    let activeCloseFunc: (() => Promise<void>) | null = null;

    beforeAll(async () => {
        await fs.rm(LOCAL_DEST, { recursive: true, force: true });
        await fs.mkdir(LOCAL_DEST, { recursive: true });
    });

    afterEach(async () => {
        if (activeCloseFunc) {
            try {
                await activeCloseFunc();
            } catch (err) {
                console.warn('[Cleanup Error]', err);
            } finally {
                activeCloseFunc = null;
            }
        }
    });

    it('getFile: ファイルが正しく転送され、内容が一致すること', async () => {
        const { getFile, sftpClose } = await createSftpFuncs(sftpConnInfo);
        activeCloseFunc = sftpClose;

        const srcFile = path.join(REMOTE_ROOT, 'test.txt');
        await getFile(srcFile, LOCAL_DEST, { verbose: true });

        const downloadedFile = path.join(LOCAL_DEST, 'test.txt');
        const content = await fs.readFile(downloadedFile, 'utf-8');

        expect(content).toContain('SFTP_TEST_SUCCESS_001');

        activeCloseFunc = null;
        await expect(sftpClose()).resolves.not.toThrow();
    });

    it('syncDir: ディレクトリ階層が維持され、ログファイルの内容が一致すること', async () => {
        const { syncDir, sftpClose } = await createSftpFuncs(sftpConnInfo);
        activeCloseFunc = sftpClose;

        const srcDir = path.join(REMOTE_ROOT, 'logs');
        const dstDir = path.join(LOCAL_DEST, 'logs');
        await syncDir(srcDir, dstDir, { verbose: true });

        const logFile = path.join(dstDir, 'app.log');
        const content = await fs.readFile(logFile, 'utf-8');

        expect(content).toContain('SFTP Sync Test Started');

        activeCloseFunc = null;
        await expect(sftpClose()).resolves.not.toThrow();
    });
});
