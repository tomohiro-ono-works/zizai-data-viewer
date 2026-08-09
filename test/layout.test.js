(function () {
  'use strict';

  var test = window.ReportViewerTest.test;
  var equal = window.ReportViewerTest.equal;

  test('カラム設定一覧は内部スクロールしヘッダーを固定する', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';

    var target = document.createElement('div');
    fixture.appendChild(target);

    var columns = [];
    for (var index = 0; index < 30; index += 1) {
      columns.push({ id: 'column_' + index, label: 'カラム ' + index, type: 'string' });
    }

    var viewer = new ReportViewer({
      target: target,
      schema: { title: 'Layout test', columns: columns },
      data: []
    });

    viewer._activateTab('columns');

    var grid = target.querySelector('.rv-columns-grid');
    var header = target.querySelector('.rv-columns-grid thead th');
    equal(getComputedStyle(grid).overflowY, 'auto');
    equal(getComputedStyle(header).position, 'sticky');
  });
}());
