import type { Config } from './types/Config.js';

/**
 * HTTPクライアント
 */
export class Client {
    /**
     * 共通設定
     */
    private _config: Config;

    /**
     * コンストラクタ
     * @param config 共通設定
     */
    constructor(config: Partial<Config>) {
        this._config = {
            baseUrl: '',
            headers: {},
            timeoutSec: 10,
            httpErrors: true,
            ...config,
        };
    }

    /**
     * GETリクエスト
     * @param url URL
     * @param params パラメータ
     * @param config 設定
     * @returns レスポンス
     */
    async get(
        url: string,
        params?: Record<string, unknown>,
        config?: Partial<Config>,
    ): Promise<Response> {
        const baseUrl = config?.baseUrl ?? this._config.baseUrl;
        const requestUrl = /^https?:\/\//i.test(url)
            ? new URL(url)
            : new URL(url, baseUrl);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    requestUrl.searchParams.append(key, String(value));
                }
            });
        }
        return await this._request('GET', requestUrl, undefined, config);
    }

    /**
     * POSTリクエスト
     * @param url URL
     * @param data データ
     * @param config 設定
     * @returns レスポンス
     */
    async post(
        url: string,
        data?: Record<string, unknown>,
        config?: Partial<Config>,
    ): Promise<Response> {
        const baseUrl = config?.baseUrl ?? this._config.baseUrl;
        const requestUrl = /^https?:\/\//i.test(url)
            ? new URL(url)
            : new URL(url, baseUrl);
        return await this._request('POST', requestUrl, data, config);
    }

    /**
     * リクエスト共通処理
     * @param method メソッド
     * @param url URL
     * @param data データ
     * @param config 設定
     * @returns レスポンス
     */
    private async _request(
        method: string,
        url: URL,
        data?: Record<string, unknown>,
        config?: Partial<Config>,
    ): Promise<Response> {
        // 設定マージ
        const mergedConfig = {
            ...this._config,
            ...config,
        };

        // タイムアウト設定
        const controller = new AbortController();
        const timer = setTimeout(
            () => controller.abort(),
            mergedConfig.timeoutSec * 1000,
        );

        // ヘッダー＆ボディ生成
        const headers = { ...mergedConfig.headers };
        let body: string | undefined;
        if (data) {
            body = JSON.stringify(data);
            if (
                !Object.keys(headers)
                    .some(k => k.toLowerCase() === 'content-type')
            ) {
                headers['Content-Type'] = 'application/json';
            }
        }

        // リクエストオプション生成
        const options: RequestInit = {
            method,
            headers,
            ...(body !== undefined && { body }),
            signal: controller.signal,
        };

        // リクエスト実行
        try {
            const res = await fetch(url, options);
            if (mergedConfig.httpErrors && !res.ok) {
                const msg = `[${res.status}] ${res.statusText} (${url.toString()})`;
                throw new Error(msg);
            }
            return res;
        } finally {
            clearTimeout(timer);
        }
    }
}
