# emo-dules

`emo-dules` は、様々なプロジェクトで再利用可能なモジュールを管理するためのコレクションです。  
標準APIの複雑さを隠蔽し、より使いやすいインターフェースを提供することを目的としています。

## 収録モジュール

### 💿 db
drizzle ORMの利用を助けるためのユーティリティ関数群です。  
[[詳細](./docs/db.md)]

### 🌐 http
JavaScript の標準 `fetch` API をラップしたHTTPクライアントです。  
[[詳細](./docs/http.md)]

### 📁 parse
文字列をパースするための関数です。  
CSVをはじめ、様々な形式の文字列をパースできます。  
[[詳細](./docs/parse.md)]

### 💾 storage
`readFile` や `writeFile` などのファイル操作を行う関数です。  
現在はNode.js用、リモートストレージ（HTTP通信）用の関数が利用可能です。  
[[詳細](./docs/storage.md)]

### 🔗 url
URLを操作するための関数です。  
URLの結合やクエリパラメータの追加を行うことができます。  
[[詳細](./docs/url.md)]

## 使用方法

```bash
# クローンして利用する場合
git clone https://github.com/emoriiin979/emo-dules.git

# npmで利用する場合
# GitHub Packagesから利用可能です
npm install @emoriiin979/emo-dules
```

## ライセンス

[MIT License](LICENSE)
