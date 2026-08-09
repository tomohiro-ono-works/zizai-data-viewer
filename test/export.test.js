(function () {
  'use strict';

  var runner = window.ReportViewerTest;

  runner.test('ダウンロードメニューに3種類の操作を表示する', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [{ id: 'city', label: '都市', type: 'string' }] },
      data: [{ city: '東京' }]
    });
    runner.equal(viewer.downloadMenu.querySelectorAll('.rv-export-menu__item').length, 3);
    runner.equal(viewer.downloadMenu.querySelector('[data-export-type="csv"]').textContent, 'CSVダウンロード');
    runner.equal(viewer.downloadMenu.querySelector('[data-export-type="excel"]').textContent, 'Excelダウンロード');
    runner.equal(viewer.downloadMenu.querySelector('[data-export-type="clipboard"]').textContent, 'クリップボードへコピー');
    viewer.downloadMenu.remove();
  });

  runner.test('exportイベントはformatだけを返す', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [{ id: 'city', label: '都市', type: 'string' }] },
      data: [{ city: '東京' }, { city: '大阪' }]
    });
    var received = null;
    viewer.on('export', function (event) { received = event; });
    viewer._requestExport('csv');
    runner.equal(received.format, 'csv');
    runner.equal(Object.keys(received).length, 1);
    viewer.downloadMenu.remove();
  });
}());
