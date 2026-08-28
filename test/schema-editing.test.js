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

  runner.test('lossless schema fields and arbitrary type identifiers survive rendering without normalization', function () {
    var schema = {
      title: 'Lossless schema',
      columns: [
        { origin_name: 'payload', new_name: '', description: 'Opaque bytes', ziz_datatype: 'BYTES' },
        { origin_name: 'event_time', new_name: 'Event time', description: 'Clock time', ziz_datatype: 'TIME' },
        { origin_name: 'duration', new_name: 'Duration', description: 'Elapsed time', ziz_datatype: 'INTERVAL' },
        { origin_name: 'tags', new_name: 'Tags', description: 'Tag list', ziz_datatype: 'ARRAY<T>' },
        { origin_name: 'metadata', new_name: 'Metadata', description: 'Structured data', ziz_datatype: 'STRUCT<name STRING>' }
      ]
    };
    var target = makeTarget();
    var viewer = new ReportViewer({
      target: target,
      schema: schema,
      data: [
        { payload: 'zulu', event_time: '09:00', duration: 'P1D', tags: '["first"]', metadata: '{"name":"Ada"}' },
        { payload: 'Alpha', event_time: '10:00', duration: 'P2D', tags: '["second"]', metadata: '{"name":"Bea"}' }
      ]
    });

    runner.deepEqual(viewer.getSchema(), schema, 'schema fields were normalized or discarded');
    runner.equal(target.querySelector('.rv-grid__label-button').textContent, 'payload',
      'an empty stored name must use the original name only as the display fallback');
    runner.equal(viewer.getSchema().columns[0].new_name, '',
      'the display fallback must not be persisted into an empty stored name');
    runner.equal(target.querySelector('tbody [data-column-id="payload"]').textContent, 'zulu',
      'an unsupported type must display using string semantics');

    target.querySelector('[data-column-id="payload"] .rv-grid__sort').click();
    runner.equal(target.querySelector('tbody [data-column-id="payload"]').textContent, 'Alpha',
      'an unsupported type must sort using string semantics');

    target.querySelector('[data-column-id="payload"] .rv-grid__filter-button').click();
    runner.assert(target.querySelector('.rv-filter input[type="search"]'),
      'an unsupported type must use the string filter UI');
    viewer.destroy();
  });

  runner.test('name edit commits exactly once on Enter', function () {
    var schema = {
      columns: [{ origin_name: 'payload', new_name: '', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: schema, data: [] });
    var changeCount = 0;
    viewer.on('schemachange', function () { changeCount += 1; });
    viewer._activateTab('columns');

    var name = target.querySelector('.rv-columns__name-input');
    runner.equal(name.value, '', 'the editable name input must retain an empty stored name');
    name.focus();
    name.value = 'Payload';
    name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].new_name, 'Payload');
    runner.equal(changeCount, 1, 'Enter must emit exactly one schema change');
    viewer.destroy();
  });

  runner.test('name edit commits on blur and Escape cancels the pending edit', function () {
    var schema = {
      columns: [{ origin_name: 'payload', new_name: '', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: schema, data: [] });
    var changeCount = 0;
    viewer.on('schemachange', function () { changeCount += 1; });
    viewer._activateTab('columns');

    var name = target.querySelector('.rv-columns__name-input');
    name.value = 'Payload';
    name.dispatchEvent(new Event('blur', { bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].new_name, 'Payload');
    runner.equal(changeCount, 1, 'blur must emit exactly one schema change');

    name = target.querySelector('.rv-columns__name-input');
    name.value = 'Discarded name';
    name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].new_name, 'Payload');
    runner.equal(changeCount, 1, 'Escape must not emit a schema change');
    viewer.destroy();
  });

  runner.test('optional description commits on Enter or blur and Escape cancels the pending edit', function () {
    var schema = {
      columns: [{ origin_name: 'payload', new_name: '', ziz_datatype: 'BYTES' }]
    };
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: schema, data: [] });
    var changeCount = 0;
    viewer.on('schemachange', function () { changeCount += 1; });
    viewer._activateTab('columns');

    var description = target.querySelector('.rv-columns__description-input');
    runner.equal(description.value, '', 'a missing optional description must render as an empty editor');
    description.focus();
    description.value = 'Binary payload';
    description.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].description, 'Binary payload');
    runner.equal(changeCount, 1, 'description Enter must emit exactly one schema change');

    description = target.querySelector('.rv-columns__description-input');
    description.value = 'Binary payload details';
    description.dispatchEvent(new Event('blur', { bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].description, 'Binary payload details');
    runner.equal(changeCount, 2, 'description blur must emit exactly one schema change');

    description = target.querySelector('.rv-columns__description-input');
    description.value = 'Discarded description';
    description.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].description, 'Binary payload details');
    runner.equal(changeCount, 2, 'Escape must leave the stored description unchanged');
    viewer.destroy();
  });

  runner.test('type edit retains an arbitrary current identifier and commits immediately', function () {
    var schema = {
      columns: [{ origin_name: 'payload', new_name: '', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var target = makeTarget();
    var viewer = new ReportViewer({ target: target, schema: schema, data: [] });
    var changeCount = 0;
    viewer.on('schemachange', function () { changeCount += 1; });
    viewer._activateTab('columns');

    var type = target.querySelector('.rv-columns__select');
    runner.equal(type.value, 'BYTES', 'an arbitrary type identifier must remain selected exactly');
    type.value = 'string';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    runner.equal(viewer.getSchema().columns[0].ziz_datatype, 'string');
    runner.equal(changeCount, 1, 'a type selection must emit exactly one schema change');
    viewer.destroy();
  });

  runner.test('valid JSON draft remains unsaved until Apply and emits one change when applied', function () {
    var target = makeTarget();
    var original = {
      columns: [{ origin_name: 'payload', new_name: '', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var replacement = {
      columns: [{ origin_name: 'payload', new_name: 'Applied name', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var viewer = new ReportViewer({ target: target, schema: original, data: [] });
    var changeCount = 0;
    viewer.on('schemachange', function () { changeCount += 1; });
    viewer._activateTab('json');

    var editor = target.querySelector('.rv-json__editor');
    editor.value = JSON.stringify(replacement, null, 2);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    runner.deepEqual(viewer.getSchema(), original, 'valid draft JSON must not be saved before Apply');
    runner.equal(changeCount, 0, 'editing JSON must not emit a schema change');

    target.querySelector('.rv-json__actions .rv-button--primary').click();
    runner.deepEqual(viewer.getSchema(), replacement, 'Apply must save the valid JSON exactly');
    runner.equal(changeCount, 1, 'Apply must emit exactly one schema change');
    viewer.destroy();
  });

  runner.test('invalid JSON stays visible and schema tabs remain disabled until correction is applied', function () {
    var target = makeTarget();
    var original = {
      columns: [{ origin_name: 'payload', new_name: '', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var replacement = {
      columns: [{ origin_name: 'payload', new_name: 'Applied name', description: 'Opaque bytes', ziz_datatype: 'BYTES' }]
    };
    var viewer = new ReportViewer({ target: target, schema: original, data: [] });
    var changeCount = 0;
    viewer.on('schemachange', function () { changeCount += 1; });
    viewer._activateTab('json');

    var editor = target.querySelector('.rv-json__editor');

    editor.value = '{"columns":';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    runner.equal(editor.value, '{"columns":', 'invalid JSON must remain visible without repair');
    runner.deepEqual(viewer.getSchema(), original, 'invalid JSON must not replace the stored schema');
    runner.equal(changeCount, 0, 'invalid JSON must not emit a schema change');
    runner.assert(target.querySelector('.rv-json__message').classList.contains('is-error'),
      'invalid JSON must have a clear error state');
    ['report', 'columns', 'distribution'].forEach(function (tab) {
      runner.equal(target.querySelector('[data-tab="' + tab + '"]').disabled, true,
        'invalid JSON must disable the ' + tab + ' tab');
    });

    editor.value = JSON.stringify(replacement, null, 2);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    runner.equal(target.querySelector('[data-tab="report"]').disabled, true,
      'a corrected draft must remain blocked until it is explicitly applied');
    target.querySelector('.rv-json__actions .rv-button--primary').click();
    runner.deepEqual(viewer.getSchema(), replacement, 'Apply must save the valid JSON exactly');
    runner.equal(changeCount, 1, 'Apply must emit exactly one schema change');
    ['report', 'columns', 'distribution'].forEach(function (tab) {
      runner.equal(target.querySelector('[data-tab="' + tab + '"]').disabled, false,
        'Apply must re-enable the ' + tab + ' tab');
    });
    viewer.destroy();
  });
}());
