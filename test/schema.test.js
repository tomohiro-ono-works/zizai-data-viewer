(function () {
  'use strict';

  var runner = window.ReportViewerTest;
  var fixture = document.querySelector('#test-fixture');

  function createViewer(schema) {
    fixture.innerHTML = '';
    var target = document.createElement('div');
    fixture.appendChild(target);
    return new ReportViewer({ target: target, schema: schema, data: [] });
  }

  runner.test('正常なSchemaからViewerを作成できる', function () {
    var viewer = createViewer({ columns: [{ id: 'id', type: 'number' }] });
    runner.equal(viewer.getSchema().columns.length, 1);
  });

  runner.test('重複したカラムIDを拒否する', function () {
    var thrown = false;
    try {
      createViewer({ columns: [{ id: 'id' }, { id: 'id' }] });
    } catch (error) {
      thrown = /duplicate column id/.test(error.message);
    }
    runner.assert(thrown, 'duplicate column id error was not thrown');
  });

  runner.test('省略値を正規化する', function () {
    var viewer = createViewer({ columns: [{ id: 'name' }] });
    var column = viewer.getSchema().columns[0];
    runner.equal(column.label, 'name');
    runner.equal(column.type, 'string');
    runner.equal(column.visible, true);
  });

  runner.test('対応する全データ型をSchemaで指定できる', function () {
    var types = ['string', 'integer', 'number', 'decimal', 'boolean', 'date', 'datetime', 'timestamp'];
    var viewer = createViewer({
      columns: types.map(function (type, index) {
        return { id: 'column_' + index, type: type };
      })
    });
    runner.deepEqual(viewer.getSchema().columns.map(function (column) {
      return column.type;
    }), types);
  });

  runner.test('json型を拒否する', function () {
    var thrown = false;
    try {
      createViewer({ columns: [{ id: 'payload', type: 'json' }] });
    } catch (error) {
      thrown = /unsupported column type: json/.test(error.message);
    }
    runner.assert(thrown, 'unsupported json type error was not thrown');
  });
}());
