/**
 * デフォルトのタイムアウト秒数
 */
const DEFAULT_TIMEOUT_SEC = 10;

/**
 * HTTPリクエストを実行する
 * @param method - HTTPメソッド
 * @param url - URL
 * @param body - リクエストボディ
 * @param headers - リクエストヘッダー
 * @param options - オプション
 * @returns HTTPレスポンス
 */
export async function httpFetch(request: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    headers?: Record<string, string>,
    body?: Record<string, unknown>,
    options?: {
        httpErrors?: boolean,
        timeoutSec?: number,
    },
}) {
    const { method, url, headers, body, options } = request;
    const controller = new AbortController();
    const timer = setTimeout(
        () => controller.abort(),
        (options?.timeoutSec ?? DEFAULT_TIMEOUT_SEC) * 1000,
    );
    try {
        const response = await fetch(url, {
            method,
            headers: headers ?? {},
            ...(body && { body: JSON.stringify(body) }),
            signal: controller.signal,
        });
        if (options?.httpErrors && !response.ok) {
            const msg = `[${response.status}] ${response.statusText} (${url})`;
            throw new Error(msg);
        }
        return response;
    } finally {
        clearTimeout(timer);
    }
}
