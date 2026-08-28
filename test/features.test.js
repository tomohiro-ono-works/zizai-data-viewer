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

  runner.test('featuresを省略すると既存の4タブ・実行・ダウンロードを維持する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    runner.deepEqual(viewer.features, { report: true, columns: true, json: true, distribution: true, execute: true, export: true });
    runner.equal(target.querySelectorAll('.rv__tab').length, 4);
    runner.assert(target.querySelector('.rv-button--primary'), '実行ボタンが表示されていません');
    runner.assert(target.querySelector('.rv-export'), 'ダウンロード操作が表示されていません');
    viewer.destroy();
  });

  runner.test('featuresで指定した組合せのtabだけを描画する', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({
      target: target,
      schema: makeSchema(),
      data: [{ city: '東京', amount: 100 }],
      features: { report: true, columns: true, json: false, distribution: false, execute: false, export: false }
    });
    var tabs = target.querySelectorAll('.rv__tab');
    runner.equal(tabs.length, 2);
    runner.equal(tabs[0].dataset.tab, 'report');
    runner.equal(tabs[1].dataset.tab, 'columns');
    runner.assert(!target.querySelector('[data-tab="json"]'), '無効なjsonタブが描画されています');
    runner.assert(!target.querySelector('[data-tab="distribution"]'), '無効なdistributionタブが描画されています');
    runner.assert(!target.querySelector('.rv-button--primary'), '無効なexecuteボタンが描画されています');
    runner.assert(!target.querySelector('.rv-export'), '無効なexport操作が描画されています');
    runner.assert(!document.querySelector('.rv-export-menu'), '無効なexportメニューが生成されています');
    viewer.destroy();
  });

  runner.test('activeTabが無効な場合は最初の有効tabへ自動的に切り替わる', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({
      target: target,
      schema: makeSchema(),
      data: [{ city: '東京', amount: 100 }],
      features: { report: true, columns: true, json: false, distribution: false, execute: false, export: false },
      activeTab: 'json'
    });
    runner.equal(viewer.activeTab, 'report');
    var activeTabButton = target.querySelector('.rv__tab.is-active');
    runner.assert(activeTabButton, '有効なタブがアクティブになっていません');
    runner.equal(activeTabButton.dataset.tab, 'report');
    viewer.destroy();
  });

  runner.test('activeTabで有効なtabを明示指定すると初期表示に反映される', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({
      target: target,
      schema: makeSchema(),
      data: [{ city: '東京', amount: 100 }],
      activeTab: 'columns'
    });
    runner.equal(viewer.activeTab, 'columns');
    runner.equal(target.querySelector('.rv__tab.is-active').dataset.tab, 'columns');
    viewer.destroy();
  });

  runner.test('export無効時はbutton・body直下メニュー・exportリスナーが存在しない', function () {
    var target = makeTarget();
    var baselineMenus = document.querySelectorAll('.rv-export-menu').length;
    var viewer = new ReportViewer({
      target: target,
      schema: makeSchema(),
      data: [{ city: '東京', amount: 100 }],
      features: { export: false }
    });
    runner.equal(viewer.downloadMenu, undefined, 'downloadMenuが生成されています');
    runner.equal(viewer.downloadButton, undefined, 'downloadButtonが生成されています');
    runner.equal(document.querySelectorAll('.rv-export-menu').length, baselineMenus, 'exportメニューがdocumentに残っています');
    viewer.destroy();
  });

  runner.test('report・columns・exportをすべて無効化するとdocumentのpointerdownリスナーを追加しない', function () {
    var originalAdd = document.addEventListener;
    var added = [];
    document.addEventListener = function (type, handler, options) {
      added.push(type);
      return originalAdd.call(document, type, handler, options);
    };
    var target = makeTarget();
    var viewer;
    try {
      viewer = new ReportViewer({
        target: target,
        schema: makeSchema(),
        data: [{ city: '東京', amount: 100 }],
        features: { report: false, columns: false, json: true, distribution: true, execute: true, export: false }
      });
      runner.equal(added.indexOf('pointerdown'), -1, '不要なpointerdownリスナーが登録されています');
    } finally {
      document.addEventListener = originalAdd;
    }
    runner.equal(viewer.activeTab, 'json');
    viewer.destroy();
  });

  runner.test('exportメニューはDataViewer root配下に配置されbody直下の子要素にならない', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: makeSchema(), data: [{ city: '東京', amount: 100 }] });
    runner.assert(viewer.root.contains(viewer.downloadMenu), 'exportメニューがDataViewer root配下にありません');
    runner.assert(viewer.downloadMenu.parentNode !== document.body, 'exportメニューがdocument.bodyの直接の子になっています');
    var directBodyMenus = Array.prototype.filter.call(document.body.children, function (child) {
      return child.classList && child.classList.contains('rv-export-menu');
    });
    runner.equal(directBodyMenus.length, 0, 'document.body直下にexportメニューが存在します');
    viewer.destroy();
  });

  runner.test('無効化した機能はdestroy()前後でDOM・リスナー・タイマーが存在しない', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({
      target: target,
      schema: makeSchema(),
      data: [{ city: '東京', amount: 100 }],
      features: { report: true, columns: false, json: false, distribution: false, execute: false, export: false }
    });
    runner.assert(!viewer.columnsPanel, 'columnsPanelが生成されています');
    runner.assert(!viewer.jsonPanel, 'jsonPanelが生成されています');
    runner.assert(!viewer.distributionPanel, 'distributionPanelが生成されています');
    runner.assert(!viewer.downloadMenu, 'downloadMenuが生成されています');
    var error = null;
    try {
      viewer.destroy();
      viewer.destroy();
    } catch (e) {
      error = e;
    }
    runner.equal(error, null, 'destroy()の呼び出しでエラーが発生しました: ' + (error && error.message));
    runner.equal(target.innerHTML, '', 'destroy()後もDOMが残っています');
  });

  runner.test('json・distributionを無効にしてもsetSchema/setDistributionは例外を投げない', function () {
    var target = makeTarget();
    var viewer = new ReportViewer({
      target: target,
      schema: makeSchema(),
      data: [{ city: '東京', amount: 100 }],
      features: { report: true, columns: true, json: false, distribution: false, execute: true, export: true }
    });
    var error = null;
    try {
      viewer.setSchema(makeSchema());
      viewer.setDistribution([{ id: 'city', label: '都市', values: [{ value: '東京', count: 1 }] }]);
    } catch (e) {
      error = e;
    }
    runner.equal(error, null, '無効タブに関連するsetterでエラーが発生しました: ' + (error && error.message));
    viewer.destroy();
  });
}());
