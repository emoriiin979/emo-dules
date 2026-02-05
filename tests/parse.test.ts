import { describe, it, expect } from 'vitest';
import { parseCsv } from '../src/modules/parse';

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
