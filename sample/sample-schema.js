window.sampleReportSchema = {
  title: '商品一覧',
  columns: [
    { id: 'id', label: 'ID', type: 'integer' },
    { id: 'name', label: '商品名', type: 'string' },
    { id: 'category', label: 'カテゴリ', type: 'string' },
    { id: 'price', label: '価格', type: 'decimal' },
    { id: 'score', label: '実数サンプル', type: 'number' },
    { id: 'stock', label: '在庫数', type: 'integer' },
    { id: 'active', label: '販売中', type: 'boolean' },
    { id: 'saleDate', label: '販売日', type: 'date' },
    { id: 'createdAt', label: '登録日時', type: 'datetime' },
    { id: 'updatedAt', label: '更新日時', type: 'timestamp' }
  ]
};
