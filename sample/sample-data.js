window.sampleReportData = Array.from({ length: 80 }, function (_, index) {
  return {
    id: index + 1,
    name: '商品' + String(index + 1).padStart(3, '0'),
    category: ['食品', '雑貨', '家電'][index % 3],
    price: String(500 + index * 125) + '.00',
    score: 1234.5 + index * 9876.54,
    stock: (index * 7) % 41,
    active: index % 5 !== 0,
    saleDate: '2026-08-' + String((index % 28) + 1).padStart(2, '0'),
    createdAt: '2026-08-' + String((index % 28) + 1).padStart(2, '0') + 'T' + String(index % 24).padStart(2, '0') + ':30:00',
    updatedAt: new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString()
  };
});
