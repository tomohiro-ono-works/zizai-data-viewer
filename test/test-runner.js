(function () {
  'use strict';

  var output = document.querySelector('#test-output');
  var summary = document.querySelector('#test-summary');
  var passed = 0;
  var failed = 0;

  function test(name, callback) {
    try {
      callback();
      passed += 1;
      write(name, null);
    } catch (error) {
      failed += 1;
      write(name, error);
    }
  }

  function write(name, error) {
    var item = document.createElement('li');
    item.className = error ? 'fail' : 'pass';
    item.textContent = (error ? 'FAIL: ' : 'PASS: ') + name +
      (error ? ' — ' + error.message : '');
    output.appendChild(item);
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'assertion failed');
    }
  }

  function equal(actual, expected, message) {
    assert(Object.is(actual, expected), message ||
      ('expected ' + JSON.stringify(expected) + ', actual ' + JSON.stringify(actual)));
  }

  function deepEqual(actual, expected, message) {
    equal(JSON.stringify(actual), JSON.stringify(expected), message);
  }

  window.ReportViewerTest = {
    test: test,
    assert: assert,
    equal: equal,
    deepEqual: deepEqual,
    finish: function () {
      summary.textContent = passed + ' passed, ' + failed + ' failed';
      summary.className = failed ? 'fail' : 'pass';
    }
  };
}());
