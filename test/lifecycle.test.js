(function () {
  'use strict';

  var runner = window.ReportViewerTest;

  function makeTarget() {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    return target;
  }

  function makeSchema() {
    return { columns: [
      { id: 'city', label: '都市', type: 'string' },
      { id: 'amount', label: '売上', type: 'number' }
    ] };
  }

  runner.test('ReportViewerはdestroy()メソッドを公開する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    runner.assert(typeof viewer.destroy === 'function', 'destroy()メソッドが存在しません');
    viewer.destroy();
  });

  runner.test('destroy() はdocumentのpointerdownリスナーを解除する', function () {
    var originalAdd = document.addEventListener;
    var originalRemove = document.removeEventListener;
    var added = [];
    var removed = [];
    document.addEventListener = function (type, handler, options) {
      added.push({ type: type, handler: handler });
      return originalAdd.call(document, type, handler, options);
    };
    document.removeEventListener = function (type, handler, options) {
      removed.push({ type: type, handler: handler });
      return originalRemove.call(document, type, handler, options);
    };
    try {
      var target = makeTarget();
      var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
      var pointerdownAdds = added.filter(function (e) { return e.type === 'pointerdown'; });
      runner.assert(pointerdownAdds.length > 0, 'pointerdownリスナーが登録されていません');
      viewer.destroy();
      var pointerdownRemoves = removed.filter(function (e) { return e.type === 'pointerdown'; });
      runner.equal(pointerdownRemoves.length, pointerdownAdds.length,
        'destroy()実行後もdocumentのpointerdownリスナーが残っています');
      pointerdownAdds.forEach(function (entry) {
        var matched = pointerdownRemoves.some(function (r) { return r.handler === entry.handler; });
        runner.assert(matched, '追加したリスナーと同一の関数が解除されていません');
      });
    } finally {
      document.addEventListener = originalAdd;
      document.removeEventListener = originalRemove;
    }
  });

  runner.test('destroy() はbody直下のダウンロードメニューを削除する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    var menu = viewer.downloadMenu;
    runner.assert(document.body.contains(menu), 'ダウンロードメニューがbodyに追加されていません');
    viewer.destroy();
    runner.assert(!document.body.contains(menu), 'destroy()後もダウンロードメニューがbodyに残っています');
  });

  runner.test('destroy() はターゲット要素のDOMとrvクラスを取り除く', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    runner.assert(target.classList.contains('rv'), '初期化時にrvクラスが付与されていません');
    viewer.destroy();
    runner.equal(target.innerHTML, '', 'destroy()後もターゲット要素にDOMが残っています');
    runner.assert(!target.classList.contains('rv'), 'destroy()後もrvクラスが残っています');
  });

  runner.test('destroy() は登録済みのイベントハンドラを解放する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    var calls = 0;
    viewer.on('execute', function () { calls += 1; });
    viewer.destroy();
    viewer._emit('execute', { schema: null });
    runner.equal(calls, 0, 'destroy()後もイベントハンドラが呼び出されています');
  });

  runner.test('destroy() は複数回呼び出してもエラーにならない', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    viewer.destroy();
    var error = null;
    try {
      viewer.destroy();
    } catch (e) {
      error = e;
    }
    runner.equal(error, null, 'destroy()の再呼び出しでエラーが発生しました: ' + (error && error.message));
  });

  runner.test('destroyしてから同じターゲットに再生成すると、リスナーとメニューが重複しない', function () {
    var target = makeTarget();
    var baselineMenus = document.body.querySelectorAll('.rv-export-menu').length;

    var originalAdd = document.addEventListener;
    var originalRemove = document.removeEventListener;
    var added = [];
    var removed = [];
    document.addEventListener = function (type, handler, options) {
      added.push({ type: type, handler: handler });
      return originalAdd.call(document, type, handler, options);
    };
    document.removeEventListener = function (type, handler, options) {
      removed.push({ type: type, handler: handler });
      return originalRemove.call(document, type, handler, options);
    };

    try {
      var viewer1 = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
      runner.equal(document.body.querySelectorAll('.rv-export-menu').length, baselineMenus + 1,
        '1回目の生成でメニューが1つ追加されていません');
      viewer1.destroy();
      runner.equal(document.body.querySelectorAll('.rv-export-menu').length, baselineMenus,
        'destroy()後もメニューが残っています');

      var viewer2 = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
      runner.equal(document.body.querySelectorAll('.rv-export-menu').length, baselineMenus + 1,
        '再生成後にメニューが1つだけになっていません');
      runner.assert(document.body.contains(viewer2.downloadMenu), '再生成後のメニューがbodyにありません');

      var pointerdownAdds = added.filter(function (e) { return e.type === 'pointerdown'; });
      var pointerdownRemoves = removed.filter(function (e) { return e.type === 'pointerdown'; });
      runner.equal(pointerdownAdds.length - pointerdownRemoves.length, 1,
        '有効なpointerdownリスナーが1つだけではありません');

      viewer2.on('execute', function () {});
      viewer2._emit('pagechange', { offset: 0, limit: 10 });
      runner.assert(target.querySelector('.rv-grid'), '再生成後に帳票が正常に描画されていません');

      viewer2.destroy();
      runner.equal(document.body.querySelectorAll('.rv-export-menu').length, baselineMenus,
        '2回目のdestroy()後もメニューが残っています');
    } finally {
      document.addEventListener = originalAdd;
      document.removeEventListener = originalRemove;
    }
  });

  runner.test('destroy() はダウンロードメニューの非表示タイマーを解除する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    var originalSetTimeout = window.setTimeout;
    var originalClearTimeout = window.clearTimeout;
    var scheduledIds = [];
    var clearedIds = [];
    window.setTimeout = function (handler, timeout) {
      var id = originalSetTimeout(handler, timeout);
      scheduledIds.push(id);
      return id;
    };
    window.clearTimeout = function (id) {
      clearedIds.push(id);
      return originalClearTimeout(id);
    };
    try {
      viewer.downloadAction.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      viewer.downloadAction.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      runner.equal(scheduledIds.length, 1, '非表示タイマーが設定されていません');
      viewer.destroy();
      runner.assert(clearedIds.indexOf(scheduledIds[0]) >= 0,
        'destroy()実行後も非表示タイマーが解除されていません');
    } finally {
      window.setTimeout = originalSetTimeout;
      window.clearTimeout = originalClearTimeout;
    }
  });

  runner.test('destroy() はroot以外の保持DOM参照を解放する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    var domKeys = Object.keys(viewer).filter(function (key) {
      return key !== 'root' && viewer[key] instanceof Node;
    });
    runner.assert(domKeys.length > 0, '検証対象のDOM参照が見つかりません');
    viewer.destroy();
    var remaining = domKeys.filter(function (key) { return viewer[key] instanceof Node; });
    runner.deepEqual(remaining, [], 'destroy()後もDOM参照が残っています: ' + remaining.join(', '));
    runner.assert(viewer.root instanceof Node, 'rootはmountターゲットとして保持され続ける必要があります');
  });

  runner.test('destroy() は進行中の列幅リサイズが保持するdocumentリスナーを解除する', function () {
    var originalAdd = document.addEventListener;
    var originalRemove = document.removeEventListener;
    var added = [];
    var removed = [];
    document.addEventListener = function (type, handler, options) {
      added.push({ type: type, handler: handler });
      return originalAdd.call(document, type, handler, options);
    };
    document.removeEventListener = function (type, handler, options) {
      removed.push({ type: type, handler: handler });
      return originalRemove.call(document, type, handler, options);
    };
    try {
      var target = makeTarget();
      var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
      added.length = 0;
      removed.length = 0;
      var resizer = target.querySelector('.rv-column-resizer');
      resizer.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 100 }));
      var types = ['pointermove', 'pointerup', 'pointercancel'];
      types.forEach(function (type) {
        var addCount = added.filter(function (e) { return e.type === type; }).length;
        runner.equal(addCount, 1, 'リサイズ開始時に' + type + 'リスナーが登録されていません');
      });
      viewer.destroy();
      types.forEach(function (type) {
        var addCount = added.filter(function (e) { return e.type === type; }).length;
        var removeCount = removed.filter(function (e) { return e.type === type; }).length;
        runner.equal(removeCount, addCount, 'destroy()後も' + type + 'リスナーが残っています');
      });
    } finally {
      document.addEventListener = originalAdd;
      document.removeEventListener = originalRemove;
    }
  });
}());
