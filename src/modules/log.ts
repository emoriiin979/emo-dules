import { type MiddlewareHandler } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import pino from 'pino';

/**
 * Type: Logger 用設定
 */
type LoggerConfig = {
};

/**
 * Type: ログ形式
 */
type LogAttributes = {
    [key: string]: any,
};

/**
 * Pino Logger オブジェクトを生成する
 * @internal
 * @param config - 設定
 * @returns Logger オブジェクト
 */
function createLogger(config?: LoggerConfig): pino.Logger {
    return pino({
        base: null,
        messageKey: 'message',
        formatters: {
            level: label => ({ level: label.toUpperCase() }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    });
}

/**
 * ログ出力関数群を生成する
 * @param config - 設定
 * @returns ログ出力関数群
 */
export function createLogFuncs(config?: LoggerConfig) {
    const p = createLogger(config);
    return {
        /**
         * INFOログを出力する
         * @param message - メッセージ
         * @param attributes - 追加情報
         */
        logInfo: (
            message: string,
            attributes?: LogAttributes,
        ) => {
            p.info(attributes || {}, message);
        },
        /**
         * ERRORログを出力する
         * @param message - メッセージ
         * @param attributes - 追加情報（エラーオブジェクトなど）
         */
        logError: (
            message: string,
            attributes?: LogAttributes & { err?: unknown },
        ) => {
            p.error(attributes || {}, message);
        },
    };
}

/**
 * Hono アプリのリクエスト/レスポンスを自動的に記録するミドルウェアを生成する
 * - Hono.js 専用
 * @param config - 設定
 * @returns ミドルウェア
 */
export function createLoggerMiddleware(config?: LoggerConfig): MiddlewareHandler {
    const { logInfo } = createLogFuncs(config);
    return honoLogger((message: string, ...rest: string[]) => {
        const output = message + (rest.length > 0 ? ` ${rest.join(' ')}` : '');
        logInfo(output);
    });
}
