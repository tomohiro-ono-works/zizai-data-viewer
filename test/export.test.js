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

  runner.test('exportメニューのスタイルはDataViewer root(.rv)配下にスコープされている', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var outside = document.createElement('div');
    outside.className = 'rv-export-menu is-open';
    var item = document.createElement('button');
    item.className = 'rv-export-menu__item';
    outside.appendChild(item);
    fixture.appendChild(outside);
    var outsideStyle = window.getComputedStyle(outside);
    runner.assert(outsideStyle.position !== 'fixed', '.rv配下ではないrv-export-menuにfixedスタイルが適用されています');
    runner.assert(outsideStyle.boxShadow === 'none' || outsideStyle.boxShadow === '', '.rv配下ではないrv-export-menuにbox-shadowスタイルが適用されています');

    var root = document.createElement('div');
    root.className = 'rv';
    var inside = document.createElement('div');
    inside.className = 'rv-export-menu is-open';
    root.appendChild(inside);
    fixture.appendChild(root);
    var insideStyle = window.getComputedStyle(inside);
    runner.equal(insideStyle.position, 'fixed', '.rv配下のrv-export-menuにfixedスタイルが適用されていません');
    runner.equal(insideStyle.display, 'block', '.rv配下のrv-export-menu.is-openにdisplay:blockが適用されていません');

    outside.remove();
    root.remove();
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
