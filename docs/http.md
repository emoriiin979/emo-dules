# httpFetch

`httpFetch`は、`fetch`をラップした関数です。

```typescript
httpFetch(request: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    headers: Record<string, string> = {},
    body: Record<string, unknown> = {},
    options: {
        httpErrors: boolean = true,
        timeoutSec: number = 10,
    },
}): Promise<Response>
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE'` | HTTPメソッド。 |
| `url` | `string` | リクエスト先URL。 |
| `headers` | `Record<string, string>` | (任意) リクエストヘッダー。 |
| `body` | `Record<string, unknown>` | (任意) リクエストボディ。<br>指定されたオブジェクトは `JSON.stringify` され、送信されます。 |
| `options` | `object` | (任意) オプション設定。<br>設定可能な項目は後述。|

### オプション

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `httpErrors` | `boolean` | `true` の場合、レスポンスが OK (2xx) でないとエラーを発生させます。 |
| `timeoutSec` | `number` | タイムアウト秒数 (デフォルト: 10)。 |

## 戻り値

`Response` オブジェクトを返します。

## 利用方法

### `GET` リクエスト

```typescript
import { httpFetch } from '@emoriiin979/emo-dules';

const response = await httpFetch({
    method: 'GET',
    url: 'https://example.com/users/?page=1&limit=10',
});
const users = await response.json();
```

### `POST` リクエスト

```typescript
import { httpFetch } from '@emoriiin979/emo-dules';

await httpFetch({
    method: 'POST',
    url: 'https://example.com/users/',
    headers: { 'Content-Type': 'application/json' },
    body: {
        name: 'Alice',
        email: 'alice@example.com',
    },
});
```
