import { describe, it, expect } from 'vitest';
import { parseCsv, parseCustomFormat } from '../src/modules/parse';

describe('parseCsv', () => {
    it('CSVを正しくパースできること', async () => {
        const csvContent = `
"name","age","email"
"Alice","30","alice@example.com"
"Bob","25","bob@example.com"
`;
        const rows = await parseCsv(csvContent);
        expect(rows).toEqual([
            ['name', 'age', 'email'],
            ['Alice', '30', 'alice@example.com'],
            ['Bob', '25', 'bob@example.com'],
        ]);
    });

    it('空のCSVをパースできること', async () => {
        const csvContent = '';
        const rows = await parseCsv(csvContent);
        expect(rows).toEqual([]);
    });

    it('ヘッダーのみのCSVをパースできること', async () => {
        const csvContent = `
"name","age","email"
`;
        const rows = await parseCsv(csvContent);
        expect(rows).toEqual([
            ['name', 'age', 'email'],
        ]);
    });

    it('囲い文字が無いCSVをパースできること', async () => {
        const csvContent = `
name,age,email
Alice,30,alice@example.com
Bob,25,bob@example.com
`;
        const rows = await parseCsv(csvContent);
        expect(rows).toEqual([
            ['name', 'age', 'email'],
            ['Alice', '30', 'alice@example.com'],
            ['Bob', '25', 'bob@example.com'],
        ]);
    });

    it('囲い文字が混在するCSVをパースできること', async () => {
        const csvContent = `
"name",age,"email"
Alice,"30",alice@example.com
"Bob",25,"bob@example.com"
`;
        const rows = await parseCsv(csvContent);
        expect(rows).toEqual([
            ['name', 'age', 'email'],
            ['Alice', '30', 'alice@example.com'],
            ['Bob', '25', 'bob@example.com'],
        ]);
    });
});

describe('parseCustomFormat', () => {
    it('指定したフォーマットで正しくパースできること', async () => {
        const content = `
ID:101, Name:Alice
ID:102, Name:Bob
`;
        const format = /ID:(\d+), Name:(\w+)/;
        const rows = await parseCustomFormat(content, format);
        expect(rows).toEqual([
            ['101', 'Alice'],
            ['102', 'Bob'],
        ]);
    });

    it('空の文字列をパースした場合、空の配列を返すこと', async () => {
        const content = '';
        const format = /(\w+)/;
        const rows = await parseCustomFormat(content, format);
        expect(rows).toEqual([]);
    });

    it('フォーマットに一致しない行は除外されること', async () => {
        const content = `
Valid:Yes
Invalid:No
Valid:Maybe
`;
        const format = /^Valid:(\w+)/;
        const rows = await parseCustomFormat(content, format);
        expect(rows).toEqual([
            ['Yes'],
            ['Maybe'],
        ]);
    });

    it('複雑なログ形式をパースできること', async () => {
        const content = `
[2024-01-01] ERROR - Connection failed
[2024-01-02] INFO - User logged in
`;
        const format = /^\[(.+?)\]\s(\w+)\s-\s(.+)$/;
        const rows = await parseCustomFormat(content, format);
        expect(rows).toEqual([
            ['2024-01-01', 'ERROR', 'Connection failed'],
            ['2024-01-02', 'INFO', 'User logged in'],
        ]);
    });

    it('空行が含まれていても無視されること', async () => {
        const content = `
Key:A

Key:B
`;
        const format = /Key:(\w+)/;
        const rows = await parseCustomFormat(content, format);
        expect(rows).toEqual([
            ['A'],
            ['B'],
        ]);
    });
});
