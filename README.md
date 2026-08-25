# zizai-data-viewer

`zizai-data-viewer` は、JSON形式のカラム定義・行データ・ページ情報・集計済み分布データを受け取り、ブラウザ上で閲覧・確認するためのJavaScriptライブラリです。

HTML、CSS、標準JavaScriptだけで動作します。Node.js、npm、ビルド処理、外部ライブラリは必須ではありません。

## 責務

このライブラリが担当します。

- 閲覧専用のデータ表表示
- 固定ヘッダー、行番号、列幅変更
- ソート、型別フィルター
- カラム名・データ型の編集
- JSONによるカラム定義編集
- 集計済み分布データの表示
- 前後ページ移動UIと `pagechange` イベント通知
- 実行要求の `execute` イベント通知
- CSV / Excel / クリップボード出力要求の `export` イベント通知

このライブラリは、バックエンド通信、SQL実行、全件データ取得、分布集計、CSV・Excelファイル生成、クリップボード書き込みを行いません。これらは利用側のアプリケーションで実装します。

## フォルダ構成

```text
├─ src/
│  ├─ report-viewer.js
│  └─ report-viewer.css
├─ sample/
│  ├─ index.html
│  ├─ sample-schema.js
│  ├─ sample-data.js
│  └─ sample-distribution.js
├─ test/
└─ README.md
```

## 読み込み

```html
<link rel="stylesheet" href="./src/report-viewer.css">
<div id="report"></div>
<script src="./src/report-viewer.js"></script>
```

## 生成

```javascript
var viewer = new ReportViewer({
  target: '#report',
  schema: {
    title: '商品一覧',
    columns: [
      { id: 'id', label: 'ID', type: 'integer' },
      { id: 'name', label: '商品名', type: 'string' },
      { id: 'price', label: '価格', type: 'decimal' }
    ]
  },
  data: [
    { id: 1, name: '商品001', price: '1200.00' },
    { id: 2, name: '商品002', price: '2500.00' }
  ],
  pageInfo: {
    offset: 0,
    limit: 200,
    total: 12430
  },
  distribution: [
    {
      id: 'price',
      label: '価格',
      values: [
        { value: '0–999', count: 120 },
        { value: '1,000–1,999', count: 340 }
      ]
    }
  ]
});
```

返り値: `ReportViewer` インスタンス。

## カラム定義

対応する `type` は次の8種類です。

| type | JavaScriptで渡す値 |
|---|---|
| `string` | `string` |
| `integer` | `number` / `bigint` / `string` |
| `number` | `number` |
| `decimal` | `string` |
| `boolean` | `boolean` |
| `date` | `string` (`YYYY-MM-DD`) |
| `datetime` | `string` |
| `timestamp` | `string` / `Date` |

`null` はカラム型ではなくセル値として扱います。

## 公開API

### `setSchema(schema)`

カラム定義を差し替えます。

```javascript
viewer.setSchema(schema);
```

返り値: `undefined`

### `getSchema()`

現在のカラム定義を取得します。

```javascript
var schema = viewer.getSchema();
```

返り値: Schemaオブジェクトのコピー。

### `getSchemaJson()`

現在のカラム定義を整形済みJSON文字列で取得します。

```javascript
var json = viewer.getSchemaJson();
```

返り値: `string`

### `setData(rows)`

現在表示する行データを差し替えます。

```javascript
viewer.setData(rows);
```

返り値: `undefined`

### `getData()`

現在ライブラリに設定されている行データを取得します。

```javascript
var rows = viewer.getData();
```

返り値: 行配列のコピー。

### `setPageInfo(pageInfo)`

バックエンドページング用の情報を設定します。行データとは別に指定します。

```javascript
viewer.setPageInfo({
  offset: 0,
  limit: 200,
  total: 12430
});
```

返り値: `undefined`

### `getPageInfo()`

現在のページ情報を取得します。

```javascript
var pageInfo = viewer.getPageInfo();
```

返り値:

```javascript
{
  offset: 0,
  limit: 200,
  total: 12430
}
```

未設定時は `null`。

### `setDistribution(distributions)`

フィールドごとの集計済み分布データを設定します。ライブラリ自身は集計しません。

```javascript
viewer.setDistribution([
  {
    id: 'category',
    label: 'カテゴリ',
    values: [
      { value: '食品', count: 120 },
      { value: '雑貨', count: 80 }
    ]
  },
  {
    id: 'price',
    label: '価格',
    values: [
      { value: '0–999', count: 50 },
      { value: '1,000–1,999', count: 75 }
    ]
  }
]);
```

数値型の範囲分けや日付のまとめ方など、`value` の定義は利用側で行います。ライブラリは受け取った `value` と `count` を表示します。

返り値: `ReportViewer` インスタンス。

`setDistribution(null)` でクリアできます。

### `getDistribution()`

現在設定されている分布データを取得します。

```javascript
var distributions = viewer.getDistribution();
```

返り値: 分布データ配列のコピー。未設定時は `null`。

### `on(eventName, handler)`

イベントハンドラを登録します。

```javascript
viewer.on('pagechange', function (event) {
  console.log(event.offset, event.limit);
});
```

返り値: `ReportViewer` インスタンス。

### `destroy()`

インスタンスの後始末を行います。SPA遷移や画面破棄時など、`ReportViewer` を使い終えたタイミングで呼び出してください。

```javascript
viewer.destroy();
```

返り値: `undefined`

`destroy()` は次を行います。

- `document` に登録した内部リスナー（フィルターやダウンロードメニューの外側クリック検知など）をすべて解除
- `document.body` 直下に追加したダウンロードメニューを削除
- インスタンスが所有するDOM（`target` 配下の内容）を取り除く
- `on()` で登録済みのイベントハンドラをすべて解放

`destroy()` は複数回呼び出しても安全（冪等）です。同じ `target` に対して `destroy()` 後に再度 `new ReportViewer(...)` を実行すると、リスナーやダウンロードメニューが重複せず正常に動作します。

## イベント

### `execute`

画面の「実行」が押されたときに発火します。

```javascript
viewer.on('execute', function (event) {
  console.log(event.schema);
});
```

ハンドラに渡される値:

```javascript
{
  schema: { /* 現在のSchema */ }
}
```

### `pagechange`

「前のN件」「次のN件」が押されたときに発火します。ライブラリ自身はデータ取得を行いません。

```javascript
viewer.on('pagechange', function (event) {
  fetchRows(event.offset, event.limit).then(function (result) {
    viewer.setData(result.rows);
    viewer.setPageInfo({
      offset: event.offset,
      limit: event.limit,
      total: result.total
    });
  });
});
```

ハンドラに渡される値:

```javascript
{
  offset: 200,
  limit: 200
}
```

### `export`

「ダウンロード」メニューから次の操作を選択したときに発火します。

- CSVダウンロード
- Excelダウンロード
- クリップボードへコピー

ライブラリ自身はファイル生成・ダウンロード・クリップボード操作を行いません。

```javascript
viewer.on('export', function (event) {
  if (event.format === 'csv') {
    // アプリ側でCSV出力を実行
  }

  if (event.format === 'excel') {
    // アプリ側でExcel出力を実行
  }

  if (event.format === 'clipboard') {
    // アプリ側でクリップボード処理を実行
  }
});
```

ハンドラに渡される値:

```javascript
{
  format: 'csv'
}
```

`format` は `'csv'` / `'excel'` / `'clipboard'` のいずれかです。行データ、Schema、フィルター条件、ソート条件は含みません。

### `schemachange`

カラム名やデータ型が変更されたときに発火します。

```javascript
viewer.on('schemachange', function (schema) {
  console.log(schema);
});
```

ハンドラに渡される値: 更新後のSchemaオブジェクト。

### `sort`

帳票のソート状態が変更されたときに発火します。

```javascript
viewer.on('sort', function (sort) {
  console.log(sort.id, sort.direction);
});
```

ハンドラに渡される値:

```javascript
{
  id: 'price',
  direction: 'asc'
}
```

`direction` は `'asc'` / `'desc'` / `null`。ソート解除時は `id` と `direction` が `null` になります。

### `filter`

帳票のフィルターが変更されたときに発火します。

```javascript
viewer.on('filter', function (event) {
  console.log(event.columnId, event.filter);
});
```

ハンドラに渡される値:

```javascript
{
  columnId: 'price',
  filter: { /* 適用されたフィルター条件 */ }
}
```

フィルター解除時は `filter` が `null` になります。

## サンプルとテスト

- `sample/index.html`: 基本的な利用例
- `test/index.html`: ブラウザ上で実行するテスト
