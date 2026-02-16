# createLogFuncs

`createLogFuncs` は、構造化ログを出力するための関数群（`logInfo`, `logError`）を生成します。

```typescript
createLogFuncs(config?: LoggerConfig): {
    logInfo: (message: string, attributes?: LogAttributes) => void;
    logError: (message: string, attributes?: LogAttributes & { err?: unknown }) => void;
}
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `config` | `LoggerConfig` | (任意) ログ出力の設定。現在は空オブジェクト `{}`。 |

## 戻り値

ログ出力関数群を含むオブジェクトを返します。

## 利用方法

```typescript
import { createLogFuncs } from '@emoriiin979/emo-dules';

const { logInfo, logError } = createLogFuncs();
```

### logInfo

INFO レベルのログを標準出力に書き出します。  
JSON 形式で出力され、追加情報を属性として付与できます。

```typescript
logInfo(message: string, attributes?: LogAttributes): void
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `message` | `string` | ログメッセージ。 |
| `attributes` | `LogAttributes` | (任意) ログに含める追加情報（オブジェクト形式）。 |

```typescript
logInfo('User login success', { userId: 'user_01', ip: '192.168.1.1' });
```

### logError

ERROR レベルのログを標準出力に書き出します。  
エラーオブジェクトを渡すことで、スタックトレース等の詳細情報も記録されます。

```typescript
logError(message: string, attributes?: LogAttributes & { err?: unknown }): void
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `message` | `string` | ログメッセージ。 |
| `attributes` | `LogAttributes` | (任意) ログに含める追加情報。エラーオブジェクトは `err` プロパティに指定します。 |

```typescript
try {
    // 何らかの処理
} catch (error) {
    logError('Critical system error', { err: error, severity: 'high' });
}
```

---

# createLoggerMiddleware

`createLoggerMiddleware` は、Hono アプリケーションのリクエストおよびレスポンスを自動的に記録するミドルウェアを生成します。

```typescript
createLoggerMiddleware(config?: LoggerConfig): MiddlewareHandler
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `config` | `LoggerConfig` | (任意) ログ出力の設定。現在は空オブジェクト `{}`。 |

## 戻り値

Hono の `MiddlewareHandler` を返します。

## 利用方法

Hono の `app.use` に登録することで、全てのリクエストに対してアクセスログが JSON 形式で出力されます。

```typescript
import { Hono } from 'hono';
import { createLoggerMiddleware } from '@emoriiin979/emo-dules';

const app = new Hono();

app.use('*', createLoggerMiddleware());

app.get('/api/data', (c) => c.json({ ok: true }));
```

---

## 開発環境でのログ整形

本モジュールのログは、常に標準的な JSON 形式で出力されます。  
開発時に人間が読みやすい形式（Pretty Print）で表示したい場合は、CLI ツールを利用して出力を整形してください。

```bash
# pino-pretty を利用した整形例
npm run dev | npx pino-pretty
```
