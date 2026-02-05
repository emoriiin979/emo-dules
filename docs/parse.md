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
