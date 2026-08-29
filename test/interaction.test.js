(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var lib = window.ReportViewerInternals;

  runner.test('列幅は80pxから600pxの範囲に制限する', function () {
    runner.equal(lib.clampColumnWidth(20), 80);
    runner.equal(lib.clampColumnWidth(240.4), 240);
    runner.equal(lib.clampColumnWidth(900), 600);
  });

  runner.test('データ表とカラム設定表に列幅変更ハンドルを描画する', function () {
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
      data: [{ city: '東京', amount: 100 }]
    });
    runner.equal(target.querySelectorAll('.rv-grid thead .rv-column-resizer').length, 2);
    viewer._activateTab('columns');
    runner.equal(target.querySelectorAll('.rv-columns-grid thead .rv-column-resizer').length, 4);
  });

  runner.test('ホスト側のinput幅指定がフィルターのチェックボックスを引き伸ばさない', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '<style>input { width: 100%; }</style>';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [{ id: 'city', label: '都市', type: 'string' }] },
      data: [{ city: '東京' }, { city: '大阪' }]
    });
    target.querySelector('.rv-grid__filter-button').click();
    var checkbox = target.querySelector('.rv-filter__choice input[type="checkbox"]');
    runner.assert(checkbox.getBoundingClientRect().width <= 18, 'チェックボックスの幅がホストCSSで拡張されました');
    viewer.destroy();
  });

  runner.test('帳票とカラム設定の明示列幅を余白へ再配分しない', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    target.style.width = '1200px';
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [
        { id: 'city', label: '都市', type: 'string' },
        { id: 'amount', label: '売上', type: 'number' }
      ] },
      data: [{ city: '東京', amount: 100 }]
    });
    var reportHeaders = target.querySelectorAll('.rv-grid thead th');
    runner.equal(Math.round(reportHeaders[0].getBoundingClientRect().width), 56);
    runner.equal(Math.round(reportHeaders[1].getBoundingClientRect().width), 145);
    runner.equal(Math.round(reportHeaders[2].getBoundingClientRect().width), 145);
    runner.equal(Math.round(target.querySelector('.rv-grid__table').getBoundingClientRect().width), 346);
    viewer._activateTab('columns');
    var columnHeaders = target.querySelectorAll('.rv-columns-grid thead th');
    [220, 220, 280, 180].forEach(function (width, index) {
      runner.equal(Math.round(columnHeaders[index].getBoundingClientRect().width), width);
    });
    runner.equal(Math.round(target.querySelector('.rv-columns-grid__table').getBoundingClientRect().width), 900);
    viewer.destroy();
  });

  runner.test('帳票ヘッダーはクリックで編集しEnterで確定できる', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [{ id: 'city', label: '都市', type: 'string' }] },
      data: []
    });
    var label = target.querySelector('.rv-grid__label-button');
    label.click();
    var input = label.querySelector('.rv-grid__label-input');
    runner.assert(input, 'ヘッダー編集入力欄が表示されていません');
    input.value = '地域';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].label, '地域');
    runner.equal(target.querySelector('.rv-grid__label-button').textContent, '地域');
  });

  runner.test('帳票ヘッダー編集はEscapeでキャンセルできる', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [{ id: 'city', label: '都市', type: 'string' }] },
      data: []
    });
    var label = target.querySelector('.rv-grid__label-button');
    label.click();
    var input = label.querySelector('.rv-grid__label-input');
    input.value = '変更しない';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].label, '都市');
    runner.equal(target.querySelector('.rv-grid__label-button').textContent, '都市');
  });
}());
