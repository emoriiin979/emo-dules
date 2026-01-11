/**
 * 共通設定型
 * @property baseUrl ベースURL
 * @property headers ヘッダー
 * @property timeoutSec リクエスト全体のタイムアウト(秒)
 * @property httpErrors 4xx/5xxを例外にするか
 */
export type Config = {
    baseUrl: string;
    headers: Record<string, string>;
    timeoutSec: number;
    httpErrors: boolean;
}
