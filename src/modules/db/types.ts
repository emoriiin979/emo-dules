/**
 * 全てのDB型に付与される共通プロパティ
 */
export type BaseDbClient = {
    close: () => Promise<void>,
};
