(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var lib = window.ReportViewerInternals;

  runner.test('stringフィルターは部分一致と候補選択をANDで判定する', function () {
    runner.equal(lib.matchesFilter({ type: 'string', keyword: '東', values: ['東京'] }, '東京都'), false);
    runner.equal(lib.matchesFilter({ type: 'string', keyword: '東', values: ['東京都'] }, '東京都'), true);
    runner.equal(lib.matchesFilter({ type: 'string', keyword: '京', values: [] }, '東京都'), true);
  });

  runner.test('booleanフィルターは部分一致と候補選択を判定する', function () {
    runner.equal(lib.matchesFilter({ type: 'boolean', keyword: 'tr', values: ['true'] }, true), true);
    runner.equal(lib.matchesFilter({ type: 'boolean', keyword: 'tr', values: ['false'] }, true), false);
  });

  runner.test('integerはBigIntで範囲比較する', function () {
    runner.equal(lib.matchesFilter({
      type: 'integer', min: '9007199254740992', max: '9007199254740994'
    }, '9007199254740993'), true);
  });

  runner.test('numberとdecimalを範囲比較する', function () {
    runner.equal(lib.matchesFilter({ type: 'number', min: '10.5', max: '20' }, 10.4), false);
    runner.equal(lib.matchesFilter({
      type: 'decimal', min: '0.1000000000000000001', max: '0.1000000000000000003'
    }, '0.1000000000000000002'), true);
  });

  runner.test('日付系を範囲比較する', function () {
    runner.equal(lib.matchesFilter({ type: 'date', from: '2026-08-01', to: '2026-08-31' }, '2026-08-15'), true);
    runner.equal(lib.matchesFilter({
      type: 'datetime', from: '2026-08-04T08:00', to: '2026-08-04T09:00'
    }, '2026-08-04T08:30:00'), true);
    runner.equal(lib.matchesFilter({
      type: 'timestamp', from: '2026-08-04T08:00', to: '2026-08-04T09:00'
    }, '2026-08-03T23:30:00Z'), true);
  });

  runner.test('候補値を重複排除して生成する', function () {
    runner.deepEqual(lib.getFilterCandidates([
      { city: '東京' }, { city: '大阪' }, { city: '東京' }, { city: null }
    ], 'city', 'string'), ['大阪', '東京']);
    runner.deepEqual(lib.getFilterCandidates([
      { active: true }, { active: false }, { active: true }
    ], 'active', 'boolean'), ['false', 'true']);
  });
}());
