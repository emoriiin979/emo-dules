/**
 * Date オブジェクトを指定したフォーマットの文字列に変換する
 * @param date - 変換対象の Date オブジェクト
 * @param format - フォーマット（例： "YYYY/MM/DD HH:mm:ss"）
 * @returns フォーマット済み文字列
 */
export function formatDate(date: Date, format: string): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const patternMap = {
        YYYY: date.getFullYear().toString().padStart(4, '0'),
        YY: date.getFullYear().toString().slice(-2),
        Y: date.getFullYear().toString(),
        MM: (date.getMonth() + 1).toString().padStart(2, '0'),
        M: (date.getMonth() + 1).toString(),
        DD: date.getDate().toString().padStart(2, '0'),
        D: date.getDate().toString(),
        HH: date.getHours().toString().padStart(2, '0'),
        mm: date.getMinutes().toString().padStart(2, '0'),
        ss: date.getSeconds().toString().padStart(2, '0'),
        dddd: daysFull[date.getDay()] ?? '',
        ddd: days[date.getDay()] ?? '',
    };

    const regexPattern = new RegExp(Object.keys(patternMap).join('|'), 'g');
    return format.replace(regexPattern, (match) => {
        return patternMap[match as keyof typeof patternMap];
    });
}

/**
 * 文字列を指定したフォーマットで解析して Date オブジェクトに変換する
 * @param dateStr - 変換対象の日時文字列
 * @param format - フォーマット（例： "DD/MMM/YYYY:HH:mm:ss Z"）
 * @returns 変換後の Date オブジェクト
 */
export function parseDate(dateStr: string, format: string): Date {
    const months: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    };

    const patternMap: Record<string, string> = {
        'YYYY': '(\\d{4})',
        'YY': '(\\d{2})',
        'MMM': '([A-Za-z]{3})',
        'MM': '(\\d{2})',
        'M': '(\\d{1,2})',
        'DD': '(\\d{2})',
        'D': '(\\d{1,2})',
        'HH': '(\\d{2})',
        'mm': '(\\d{2})',
        'ss': '(\\d{2})',
        'Z': '([+-]\\d{4})',
    };

    const keys: string[] = [];
    const sortedKeys = Object.keys(patternMap).sort((a, b) => b.length - a.length);
    const regexPattern = new RegExp(sortedKeys.join('|'), 'g');
    const escapedFormat = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const finalRegexStr = escapedFormat.replace(regexPattern, (match) => {
        keys.push(match);
        return patternMap[match] ?? '';
    });
    const match = dateStr.match(new RegExp(finalRegexStr));
    if (!match) return new Date(NaN);
    const values: Record<string, string> = {};
    match.slice(1).forEach((val, i) => {
        const key = keys[i];
        if (key) values[key] = val;
    });

    const now = new Date();

    let year: string;
    const currentYear = now.getFullYear();
    if (values['YYYY']) {
        year = values['YYYY'];
    } else if (values['YY']) {
        const centuryBase = Math.floor(currentYear / 100) * 100;
        const candidateYear = centuryBase + parseInt(values['YY'], 10);
        year = (candidateYear > currentYear)
            ? (candidateYear - 100).toString()
            : candidateYear.toString();
    } else {
        year = currentYear.toString();
    }

    let month: string;
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    if (values['MMM']) {
        month = months[values['MMM'].toLowerCase()] ?? currentMonth;
    } else {
        const m = values['MM'] || values['M'];
        month = m?.padStart(2, '0') ?? currentMonth;
    }

    const currentDay = now.getDate().toString().padStart(2, '0');
    const day = (values['DD'] || values['D'])?.padStart(2, '0') ?? currentDay;

    const hour = (values['HH'] || '00').padStart(2, '0');
    const min = (values['mm'] || '00').padStart(2, '0');
    const sec = (values['ss'] || '00').padStart(2, '0');
    const tz = values['Z'] || '';

    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}${tz}`);
}
