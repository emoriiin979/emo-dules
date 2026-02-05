import { parse } from 'csv-parse';

/**
 * CSVファイルを解析する
 * @param fileContent - CSVファイルの内容
 * @returns CSVファイルの行列を二次元配列として返す
 */
export async function parseCsv(fileContent: string): Promise<string[][]> {
    const parser = parse(fileContent, {
        delimiter: ',',
        columns: false,
        skip_empty_lines: true,
    });

    const rows: string[][] = [];
    for await (const row of parser) {
        rows.push(row as string[]);
    }
    return rows;
}
