import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    readFile,
    readLines,
    writeFile,
    appendFile,
    deleteFile,
} from '../../../src/modules/storage/concretes/node-storage.js';

describe('storage-node', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(
            os.tmpdir(),
            'storage-node-test-',
        ));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('readFile', async () => {
        const filePath = 'test.txt';
        const content = 'Hello, world!';
        await fs.writeFile(path.join(tempDir, filePath), content);
        expect(await readFile(path.join(tempDir, filePath))).toBe(content);
    });

    it('readLines', async () => {
        const filePath = 'test.txt';
        const content = 'Line 1\nLine 2\nLine 3';
        await fs.writeFile(path.join(tempDir, filePath), content);
        const lines: string[] = [];
        for await (const line of readLines(path.join(tempDir, filePath))) {
            lines.push(line);
        }
        expect(lines).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });

    it('writeFile', async () => {
        const filePath = 'test.txt';
        const content = 'Hello, world!';
        await writeFile(path.join(tempDir, filePath), content);
        expect(await fs.readFile(path.join(tempDir, filePath), 'utf8')).toBe(content);
    });

    it('appendFile', async () => {
        const filePath = 'test.txt';
        const content = 'Hello, world!';
        await fs.writeFile(path.join(tempDir, filePath), content);
        await appendFile(path.join(tempDir, filePath), content);
        expect(await fs.readFile(path.join(tempDir, filePath), 'utf8')).toBe(content + content);
    });

    it('deleteFile', async () => {
        const filePath = 'test.txt';
        await fs.writeFile(path.join(tempDir, filePath), 'To be deleted');
        await deleteFile(path.join(tempDir, filePath));
        await expect(fs.access(path.join(tempDir, filePath))).rejects.toThrow();
    });
});
