(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var lib = window.ReportViewerInternals;

  runner.test('カラム設定フィルターは部分一致と候補選択をANDで判定する', function () {
    runner.equal(lib.matchesColumnFilter({ keyword: '売', values: [] }, '売上金額'), true);
    runner.equal(lib.matchesColumnFilter({ keyword: '売', values: ['売上'] }, '売上金額'), false);
    runner.equal(lib.matchesColumnFilter({ keyword: '', values: ['number', 'decimal'] }, 'number'), true);
    runner.equal(lib.matchesColumnFilter({ keyword: '', values: ['number', 'decimal'] }, 'string'), false);
  });

  runner.test('カラム設定は固定ヘッダー付きテーブルで描画する', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [
        { id: 'city', label: '都市', type: 'string' },
        { id: 'amount', label: '売上', type: 'number' }
      ] },
      data: []
    });
    viewer._activateTab('columns');
    runner.equal(target.querySelectorAll('.rv-columns-grid thead th').length, 4);
    runner.equal(target.querySelectorAll('.rv-columns-grid tbody tr').length, 2);
    runner.equal(target.querySelectorAll('.rv-columns__filter-button').length, 4);
    runner.equal(getComputedStyle(target.querySelector('.rv-columns-grid thead th')).position, 'sticky');
  });
}());
