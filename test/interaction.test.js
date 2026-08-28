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
