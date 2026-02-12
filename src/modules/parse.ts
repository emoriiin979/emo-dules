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

/**
 * 指定のフォーマットで解析する
 * @param fileContent - ファイルの内容
 * @param format - フォーマット（正規表現パターン）
 * @returns ファイルの行列を二次元配列として返す
 */
export async function parseCustomFormat(
    fileContent: string,
    format: RegExp,
): Promise<string[][]> {
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
    return lines.flatMap(line => {
        const match = line.match(format);
        return match ? [match.slice(1)] : [];
    });
}
