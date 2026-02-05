# mergeUrl

`mergeUrl` は、2つの URL 文字列を一つに結合します。  

```typescript
mergeUrl(
    url1: string,
    url2: string,
): string
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `url1` | `string` | ベースURL。 |
| `url2` | `string` | マージするURL。<br>`url2` が Full URL の場合は、`url1` を無視します。 |

## 戻り値

結合した文字列を返します。

## 利用方法

```typescript
import { mergeUrl } from '@emoriiin979/emo-dules';

const url = mergeUrl('https://example.com', '/users');
console.log(url);  // https://example.com/users
```

# addUrlParams

`addUrlParams` は、URLにパラメータを追加します。  

```typescript
addUrlParams(
    url: string,
    params: Record<string, unknown>,
): string
```

## 引数

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `url` | `string` | URL。 |
| `params` | `Record<string, unknown>` | パラメータ。 |

## 戻り値

パラメータが追加されたURLを返します。

## 利用方法

```typescript
import { addUrlParams } from '@emoriiin979/emo-dules';

const url = addUrlParams('https://example.com', { page: 1, limit: 10 });
console.log(url);  // https://example.com?page=1&limit=10
```
