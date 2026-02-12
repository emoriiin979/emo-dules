# parseCsv

`parseCsv` は、CSVファイルを解析します。  

```typescript
parseCsv(
    fileContent: string,
): Promise<string[][]>
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `fileContent` | `string` | CSVファイルの内容。 |

## 戻り値

CSV形式の文字列を解析した二次元配列を返します。

## 利用方法

```typescript
import { parseCsv } from '@emoriiin979/emo-dules';

const csvContent = `
"name","age","email"
"Alice","30","[EMAIL_ADDRESS]"
"Bob","25","[EMAIL_ADDRESS]"
`;

const rows = await parseCsv(csvContent);
console.log(rows);  // [ [ 'name', 'age', 'email' ], [ 'Alice', '30', [EMAIL_ADDRESS]' ], [ 'Bob', '25', [EMAIL_ADDRESS]' ] ]
```

# parseCustomFormat

`parseCustomFormat` は、指定のフォーマット（正規表現）でテキストを解析します。

```typescript
parseCustomFormat(
    fileContent: string,
    format: RegExp,
): Promise<string[][]>
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `fileContent` | `string` | ファイルの内容。 |
| `format` | `RegExp` | フォーマット（正規表現パターン）。 |

## 戻り値

正規表現のキャプチャグループに基づき解析した二次元配列を返します。

## 利用方法

```typescript
import { parseCustomFormat } from '@emoriiin979/emo-dules';

const content = `
ID:101, Name:Alice
ID:102, Name:Bob
`;

const format = /ID:(\d+), Name:(\w+)/;

const rows = await parseCustomFormat(content, format);
console.log(rows);  // [ [ '101', 'Alice' ], [ '102', 'Bob' ] ]
```
