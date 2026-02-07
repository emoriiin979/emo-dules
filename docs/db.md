# createDbClient

`createDbClient`は、drizzleのDBクライアントを作成するためのユーティリティ関数です。

```typescript
createDbClient(
    dbType: 'mysql' | 'pgsql',
    options: MysqlConnectionInfo | PgsqlConnectionInfo,
): Mysql2Database | NodePgDatabase
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `dbType` | `'Mysql' \| 'Pgsql'` | DB種別。 |
| `options` | `MysqlConnectionInfo \| PgsqlConnectionInfo` | DB接続情報。各種必要な情報は後述。|

### MysqlConnectionInfo

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `host` | `string` | ホスト名。 |
| `port` | `number` | ポート番号。 |
| `user` | `string` | ユーザー名。 |
| `password` | `string` | パスワード。 |
| `database` | `string` | データベース名。 |

### PgsqlConnectionInfo

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `host` | `string` | ホスト名。 |
| `port` | `number` | ポート番号。 |
| `user` | `string` | ユーザー名。 |
| `password` | `string` | パスワード。 |
| `database` | `string` | データベース名。 |

## 戻り値

drizzleのDBクライアントを返します。

## 利用方法

```typescript
import { createDbClient } from '@emoriiin979/emo-dules';

const db = createDbClient('mysql', {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'test',
});
const result = await db.query('SELECT * FROM users');
```

# transaction

`transaction`は、DBのトランザクションを開始して指定したコールバック処理を実行します。  
処理の途中でエラーが発生した場合、トランザクションはロールバックされます。  
処理が完了した場合は自動的にコミットされます。

```typescript
transaction(
    db: Mysql2Database | NodePgDatabase,
    callback: (tx: MysqlTransaction | PgTransaction) => Promise<R>,
): Promise<R>
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `db` | `Mysql2Database \| NodePgDatabase` | DBクライアント。 |
| `callback` | `(tx: MysqlTransaction \| PgTransaction) => Promise<R>` | コールバック関数。<br>dbの型に応じたトランザクションオブジェクトが渡されます。 |

## 戻り値

コールバック処理の戻り値を返します。

## 利用方法

```typescript
import { transaction } from '@emoriiin979/emo-dules';

const result = await transaction(db, async (tx) => {
    await tx.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Alice', 'alice@example.com'],
    );
    const [user] = await tx.query(
        'SELECT * FROM users WHERE name = ?',
        ['Alice'],
    );
    return user;
});
```
