(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var lib = window.ReportViewerInternals;

  runner.test('分布データ配列はフィールドごとに検証して正規化できる', function () {
    runner.deepEqual(lib.normalizeDistributions([
      {
        id: 'prefecture',
        label: '都道府県',
        values: [
          { value: '東京', count: 3820 },
          { value: '大阪', count: 2140 }
        ]
      },
      {
        id: 'active',
        label: '販売中',
        values: [
          { value: true, count: 80 }
        ]
      }
    ]), [
      {
        id: 'prefecture',
        label: '都道府県',
        values: [
          { value: '東京', count: 3820 },
          { value: '大阪', count: 2140 }
        ]
      },
      {
        id: 'active',
        label: '販売中',
        values: [
          { value: true, count: 80 }
        ]
      }
    ]);
  });

  runner.test('分布データはid重複を拒否する', function () {
    var failed = false;
    try {
      lib.normalizeDistributions([
        { id: 'prefecture', values: [] },
        { id: 'prefecture', values: [] }
      ]);
    } catch (error) {
      failed = true;
    }
    runner.assert(failed, 'duplicate distribution id should be rejected');
  });

  runner.test('分布データのcountは0以上の有限数のみ許可する', function () {
    var failed = false;
    try {
      lib.normalizeDistributions([{
        id: 'prefecture',
        label: '都道府県',
        values: [{ value: '東京', count: -1 }]
      }]);
    } catch (error) {
      failed = true;
    }
    runner.assert(failed, 'negative count should be rejected');
  });

  runner.test('分布タブはSchema順にフィールドを横並び表示する', function () {
    var fixture = document.querySelector('#test-fixture');
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    var viewer = new ReportViewer({
      target: target,
      schema: {
        columns: [
          { id: 'prefecture', label: '都道府県', type: 'string' },
          { id: 'active', label: '販売中', type: 'boolean' }
        ]
      },
      data: []
    });
    viewer.setDistribution([
      {
        id: 'active',
        label: '販売中',
        values: [{ value: true, count: 80 }, { value: false, count: 20 }]
      },
      {
        id: 'prefecture',
        label: '都道府県',
        values: [{ value: '東京', count: 3820 }, { value: '大阪', count: 2140 }]
      }
    ]);
    target.querySelector('[data-tab="distribution"]').click();
    var columns = target.querySelectorAll('.rv-distribution__column');
    runner.equal(columns.length, 2);
    runner.equal(columns[0].querySelector('.rv-distribution__field-label').textContent, '都道府県');
    runner.equal(columns[1].querySelector('.rv-distribution__field-label').textContent, '販売中');
    runner.equal(target.querySelectorAll('.rv-distribution__bar-row').length, 4);
    runner.equal(columns[0].querySelector('.rv-distribution__count').textContent, '3,820');
  });
}());
