import { createFileOperators } from '../../src/modules/storage';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';

describe('storage - node', () => {
    const TEST_FILE = 'test.txt';
    const {
        readFile,
        readLines,
        writeFile,
        appendFile,
        deleteFile,
    } = createFileOperators('node');

    afterEach(async () => {
        if (fs.existsSync(TEST_FILE)) {
            await fs.promises.unlink(TEST_FILE);
        }
    });

    it('readFile', async () => {
        await fs.promises.writeFile(TEST_FILE, 'test');
        const result = await readFile(TEST_FILE);
        expect(result).toBe('test');
    });
    it('readLines', async () => {
        await fs.promises.writeFile(TEST_FILE, 'line1\nline2');
        const actual = [];
        for await (const line of readLines(TEST_FILE)) {
            actual.push(line);
        }
        expect(actual).toEqual(['line1', 'line2']);
    });
    it('writeFile', async () => {
        await writeFile(TEST_FILE, 'test');
        const result = await fs.promises.readFile(TEST_FILE, 'utf-8');
        expect(result).toBe('test');
    });
    it('appendFile', async () => {
        await fs.promises.writeFile(TEST_FILE, 'test1');
        await appendFile(TEST_FILE, 'test2');
        const result = await fs.promises.readFile(TEST_FILE, 'utf-8');
        expect(result).toBe('test1test2');
    });
    it('deleteFile', async () => {
        await fs.promises.writeFile(TEST_FILE, 'test');
        await deleteFile(TEST_FILE);
        const exists = fs.existsSync(TEST_FILE);
        expect(exists).toBe(false);
    });
});
