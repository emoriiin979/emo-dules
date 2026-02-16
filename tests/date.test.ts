import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { formatDate, parseDate } from '../src/modules/date';

describe('formatDate', () => {
    describe('指定のフォーマットで正しく変換されること', () => {
        it.each([
            { format: 'YYYY/MM/DD HH:mm:ss', expected: '0123/01/02 03:04:05' },
            { format: 'YY-MM-DD', expected: '23-01-02' },
            { format: 'YYYY', expected: '0123' },
            { format: 'MM', expected: '01' },
            { format: 'DD', expected: '02' },
            { format: 'YYYY年MM月DD日 (HH時mm分)', expected: '0123年01月02日 (03時04分)' },
            { format: 'YYYY/MM/DD HH:mm:ss.SSS', expected: '0123/01/02 03:04:05.SSS' },
            { format: 'Y/M/D', expected: '123/1/2' },
            { format: '', expected: '' },
            { format: 'no format value', expected: 'no format value' },
        ])('ケース #$i - 形式: "$format"', ({ format, expected }) => {
            // テスト用の基準となる日時 (123年1月2日 03:04:05)
            const testDate = new Date(123, 0, 2, 3, 4, 5);
            const result = formatDate(testDate, format);
            expect(result).toBe(expected);
        });
        it.each([
            { format: '(ddd)', expected: '(Thu)' },
            { format: '[dddd]', expected: '[Thursday]' },
        ])('曜日 #$i - 形式: "$format"', ({ format, expected }) => {
            // 1000年より前だと正確な曜日が分からなかったので別日でテストする (2025年1月2日(木))
            const testDate = new Date(2025, 0, 2, 3, 4, 5);
            const result = formatDate(testDate, format);
            expect(result).toBe(expected);
        });
    });

    describe('各桁数の月・日・時・分・秒が正しく処理されること', () => {
        it('1桁の年・月・日・時・分・秒が 0 埋めされること', () => {
            // 全て1桁になる日時 (2024年9月9日 01:02:03)
            const singleDigitDate = new Date(0, 8, 9, 1, 2, 3);
            singleDigitDate.setFullYear(1);
            const result = formatDate(singleDigitDate, 'YYYY/MM/DD HH:mm:ss');
            expect(result).toBe('0001/09/09 01:02:03');
        });
        it('2桁の数値（10月〜12月など）が正しく処理されること', () => {
            // 全て2桁になる日時 (2025年12月31日 23:59:59)
            const lateDate = new Date(2025, 11, 31, 23, 59, 59);
            const result = formatDate(lateDate, 'YYYY/MM/DD HH:mm:ss');
            expect(result).toBe('2025/12/31 23:59:59');
        });
    });
});

describe('parseDate', () => {
    // 現在時刻に依存するロジック（YYの補完など）があるため、システム時刻を固定する
    const mockNow = new Date('2024-05-20T10:00:00');

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(mockNow);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('フルフォーマット (YYYY-MM-DD HH:mm:ss) を正しくパースできること', () => {
        const result = parseDate('2023-12-25 15:30:45', 'YYYY-MM-DD HH:mm:ss');
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(11); // 0-indexed (December)
        expect(result.getDate()).toBe(25);
        expect(result.getHours()).toBe(15);
        expect(result.getMinutes()).toBe(30);
        expect(result.getSeconds()).toBe(45);
    });

    it('月の略称 (MMM) を正しくパースできること', () => {
        const result = parseDate('25-Dec-2023', 'DD-MMM-YYYY');
        expect(result.getMonth()).toBe(11);
        expect(result.getFullYear()).toBe(2023);
    });

    it('2桁の年 (YY) を現在の世紀に基づいて処理すること', () => {
        // 2024年現在において '23' は 2023年
        const resultRecent = parseDate('23-01-01', 'YY-MM-DD');
        expect(resultRecent.getFullYear()).toBe(2023);

        // 2024年現在において '25' (未来) は 1925年
        const resultFuture = parseDate('25-01-01', 'YY-MM-DD');
        expect(resultFuture.getFullYear()).toBe(1925);
    });

    it('フォーマットに含まれない要素を現在時刻やデフォルト値で補完すること', () => {
        // 年月日のみ指定 -> 時間は 00:00:00 になる
        const result = parseDate('2023-01-01', 'YYYY-MM-DD');
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);

        // 月日のみ指定 -> 年は現在の年 (2024) になる
        const resultNoYear = parseDate('12-31', 'MM-DD');
        expect(resultNoYear.getFullYear()).toBe(2024);
    });

    it('タイムゾーン指定 (Z) を処理できること', () => {
        const result = parseDate('2023-01-01 +0900', 'YYYY-MM-DD Z');
        expect(result.toISOString()).toContain('2022-12-31T15:00:00.000Z');
    });

    it('フォーマットが一致しない場合に Invalid Date を返すこと', () => {
        const result = parseDate('invalid-date', 'YYYY-MM-DD');
        expect(result.getTime()).toBeNaN();
    });

    it('特殊文字を含むフォーマットを正しくエスケープして処理できること', () => {
        const result = parseDate('2023/12/25 [special]', 'YYYY/MM/DD [special]');
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(11);
        expect(result.getDate()).toBe(25);
    });
});
