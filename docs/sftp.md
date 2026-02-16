# createSftpFuncs

`createSftpFuncs` は、SFTP サーバーとの接続を確立し、ファイル取得（`getFile`）やディレクトリ同期（`syncDir`）を行うための関数群を生成します。

```typescript
createSftpFuncs(config: SftpConfig): Promise<{
    getFile: (remotePath: string, localDest: string, options?: SftpOptions) => Promise<void>;
    syncDir: (remoteDir: string, localDest: string, options?: SftpOptions) => Promise<void>;
    sftpClose: () => Promise<void>;
}>
```

## 引数

### SftpConfig

SFTP サーバーへの接続に必要な情報を指定します。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `host` | `string` | 接続先サーバーのホスト名または IP アドレス。 |
| `port` | `number` | SFTP サーバーのポート番号。 |
| `username` | `string` | ログインに使用するユーザー名。 |
| `password` | `string` | ログインに使用するパスワード。 |

## 戻り値

SFTP 操作関数群を含むオブジェクトを `Promise` で返します。

## 利用方法

```typescript
import { createSftpFuncs } from '@emoriiin979/emo-dules';

const { getFile, syncDir, sftpClose } = await createSftpFuncs({
    host: 'localhost',
    port: 2222,
    username: 'user',
    password: 'password'
});
```

### getFile

リモートサーバー上の単一のファイルをローカルディレクトリへダウンロードします。

```typescript
getFile(srcFilePath: string, dstDir: string, options?: SftpOptions): Promise<void>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `srcFilePath` | `string` | リモートサーバー上のファイルパス。 |
| `dstDir` | `string` | 保存先となるローカルのディレクトリパス。 |
| `options` | `SftpOptions` | (任意) `verbose: true` を指定すると詳細なログを出力します（デフォルトは false）。 |

```typescript
await getFile('/upload/test.txt', './downloads', { verbose: true });
```

### syncDir

リモートサーバー上のディレクトリ配下を、ローカルディレクトリへ再帰的に同期（ダウンロード）します。

```typescript
syncDir(srcDir: string, dstDir: string, options?: SftpOptions): Promise<void>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `srcDir` | `string` | リモートサーバー上のソースディレクトリパス。 |
| `dstDir` | `string` | 保存先となるローカルのディレクトリパス。 |
| `options` | `SftpOptions` | (任意) `verbose: true` を指定すると詳細なログを出力します（デフォルトは false）。 |

```typescript
await syncDir('/upload/logs', './test_out/logs', { verbose: true });
```

### sftpClose

SFTP サーバーとのコネクションを明示的に終了します。
リソース漏洩を防ぐため、一連の操作が完了した後に必ず呼び出してください。

```typescript
sftpClose(): Promise<void>
```

```typescript
try {
    await getFile('/remote/path', './local/path');
} finally {
    await sftpClose();
}
```

---

## タイムアウトとエラー

SFTP 操作中にネットワークエラーや認証エラーが発生した場合、例外がスローされます。
また、Node.js プロセスを正常に終了させるために、 `try` 等を利用して確実に `sftpClose` を実行することを推奨します。
