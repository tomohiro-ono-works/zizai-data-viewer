(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var lib = window.ReportViewerInternals;

  runner.test('ページ情報を正規化できる', function () {
    runner.deepEqual(lib.normalizePageInfo({ offset: 200, limit: 200, total: 1234 }), {
      offset: 200,
      limit: 200,
      total: 1234
    });
  });

  runner.test('ページ範囲を計算できる', function () {
    runner.deepEqual(lib.getPageRange({ offset: 200, limit: 200, total: 1234 }, 200), {
      from: 201,
      to: 400
    });
    runner.deepEqual(lib.getPageRange({ offset: 1200, limit: 200, total: 1234 }, 34), {
      from: 1201,
      to: 1234
    });
    runner.deepEqual(lib.getPageRange({ offset: 0, limit: 200, total: 0 }, 0), {
      from: 0,
      to: 0
    });
  });

  runner.test('ページングUIは前後移動をpagechangeイベントで通知する', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: { columns: [{ id: 'id', label: 'ID', type: 'integer' }] },
      data: [{ id: 201 }, { id: 202 }]
    });
    viewer.setPageInfo({ offset: 200, limit: 200, total: 650 });
    var event = null;
    viewer.on('pagechange', function (detail) { event = detail; });
    target.querySelector('.rv-pagination__next').click();
    runner.deepEqual(event, { offset: 400, limit: 200 });
    target.querySelector('.rv-pagination__prev').click();
    runner.deepEqual(event, { offset: 0, limit: 200 });
  });
}());
