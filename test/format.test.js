(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var formatCellValue = window.ReportViewerInternals.formatCellValue;

  runner.test('numberを3桁カンマ区切りで表示する', function () {
    runner.equal(formatCellValue('number', 1234567.89), '1,234,567.89');
    runner.equal(formatCellValue('number', -12345.67), '-12,345.67');
  });

  runner.test('integerとdecimalは値をそのまま表示する', function () {
    runner.equal(formatCellValue('integer', 1234567), '1234567');
    runner.equal(formatCellValue('decimal', '1234567.89'), '1234567.89');
  });

  runner.test('nullは空文字列として表示する', function () {
    runner.equal(formatCellValue('number', null), '');
  });
}());
