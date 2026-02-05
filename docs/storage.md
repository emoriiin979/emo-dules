# createFileOperators

`createFileOperators` は、ファイル操作オペレータを生成します。  

```typescript
createFileOperators(
    storageType: 'Node' | 'Http',
    options: {
        basePath?: string,
    },
): FileOperators
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `storageType` | `'Node' | 'Http'` | ストレージ種別。 |
| `options` | { `basePath?: string` } | オプション。<br>ストレージ種別により異なるため、後述。 |

## 戻り値

`FileOperators` を返します。

## 利用方法

### 関数群作成

```typescript
import { createFileOperators } from '@emoriiin979/emo-dules';

const { readFile, readLines, writeFile, appendFile, deleteFile } = createFileOperators('Node', { basePath: '/tmp' });
```

### readFile

ファイルを一度にまとめて読み込みます。  
比較的サイズが小さいファイルを扱うのに適しています。

```typescript
readFile(path: string): Promise<string>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `path` | `string` | ファイルパス。<br>ベースパスからの相対パス、または絶対パスで指定します。 |

```typescript
const content = await readFile('example.txt');
```

### readLines

ファイルを一行ずつ読み込みます。  
サイズが大きいファイルを扱うのに適しています。

```typescript
readLines(path: string): AsyncGenerator<string>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `path` | `string` | ファイルパス。<br>ベースパスからの相対パス、または絶対パスで指定します。 |

```typescript
for await (const line of readLines('example.txt')) {
    console.log(line);
}
```

### writeFile

ファイルを新規作成し、書き込みます。  
ファイルが既に存在する場合は上書きされます。

```typescript
writeFile(path: string, content: string): Promise<void>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `path` | `string` | ファイルパス。<br>ベースパスからの相対パス、または絶対パスで指定します。 |
| `content` | `string` | ファイル内容。 |

```typescript
await writeFile('example.txt', 'Hello, world!');
```

### appendFile

ファイルを追記します。  
ファイルが存在しない場合は新規作成されます。

```typescript
appendFile(path: string, content: string): Promise<void>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `path` | `string` | ファイルパス。<br>ベースパスからの相対パス、または絶対パスで指定します。 |
| `content` | `string` | ファイル内容。 |

```typescript
await appendFile('example.txt', 'Hello, world!');
```

### deleteFile

ファイルを削除します。  

```typescript
deleteFile(path: string): Promise<void>
```

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `path` | `string` | ファイルパス。<br>ベースパスからの相対パス、または絶対パスで指定します。 |

```typescript
await deleteFile('example.txt');
```

## Node ストレージ

Node.jsのファイルシステムを利用できます。

```typescript
createFileOperators('Node', {
    basePath?: string,
});
```

### オプション

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `basePath` | `string` | (任意) ベースパス。<br>指定されたパスをルートとしてファイル操作を行います。 |


## Http ストレージ

`S3` や `R2` などのHTTPベースのストレージを利用できます。  

```typescript
createFileOperators('Http', {
    basePath?: string,
});
```

### オプション

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `baseUrl` | `string` | (任意) ベースURL。<br>指定されたURLをルートとしてファイル操作を行います。 |
