/**
 * URLをマージする
 * - url2 が Full URL の場合は、url1 を無視する
 * @param url1 ベースURL
 * @param url2 マージするURL
 * @returns マージされたURL
 */
export function mergeUrl(url1: string, url2: string): string {
    return (new URL(url2, url1)).toString();
}

/**
 * URLにパラメータを追加する
 * @param url URL
 * @param params URLパラメータ
 * @returns パラメータが追加されたURL
 */
export function addUrlParams(
    url: string,
    params: Record<string, unknown>,
): string {
    const u = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(v => u.searchParams.append(key, String(v)));
            return;
        }
        if (typeof value === 'object') {
            u.searchParams.append(key, JSON.stringify(value));
            return;
        }
        u.searchParams.append(key, String(value));
    });
    return u.toString();
}
