'use strict';

const createResult = require('../../lib/createResult');
const test = require('ava');
const sinon = require('sinon');
const fs = require('fs');
const Promise = require('bluebird');
const NoRefImageError = require('gemini/lib/errors/no-ref-image-error.js');

test('mapping a successful gemini test result', (t) => {
    const geminiTestResult = {
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox',
        referencePath: '/reference/image.png'
    };
    const result = createResult('success', geminiTestResult, 42);

    t.deepEqual(Object.keys(result), [ 'type', 'suitePath', 'stateName', 'browserId', 'referencePath', 'hash' ]);
    t.is(result.type, 'success');
    t.deepEqual(result.suitePath, [ 'foo' ]);
    t.is(result.stateName, 'plain');
    t.is(result.browserId, 'firefox');
    t.is(result.referencePath, '/reference/image.png');
});

test('mapping a failed gemini test result', (t) => {
    const diffPromise = {};
    const saveDiffTo = sinon.stub().returns(diffPromise);
    const readCurrent = sinon.stub(fs, 'readFile');

    readCurrent.withArgs('/tmp/current.png');

    const geminiTestResult = {
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox',
        referencePath: '/reference/image.png',
        currentPath: '/tmp/current.png',
        saveDiffTo
    };
    const result = createResult('failure', geminiTestResult, 42);
    const expectedFields = [
        'type',
        'suitePath',
        'stateName',
        'browserId',
        'referencePath',
        'imageBufferPromises',
        'hash'
    ];

    t.deepEqual(Object.keys(result), expectedFields);
    t.is(result.type, 'failure');
    t.deepEqual(result.suitePath, [ 'foo' ]);
    t.is(result.stateName, 'plain');
    t.is(result.browserId, 'firefox');
    t.is(result.referencePath, '/reference/image.png');
    t.true(saveDiffTo.calledOnce);
    t.true(readCurrent.calledOnce);
    t.is(result.imageBufferPromises.diff, diffPromise);
    t.true(result.imageBufferPromises.actual instanceof Promise);

    readCurrent.restore();
});

test('mapping a NoRefImageError gemini error', (t) => {
    const readCurrent = sinon.stub(fs, 'readFile');

    readCurrent.withArgs('/tmp/current.png');

    const error = new NoRefImageError('/reference/image.png', '/tmp/current.png');

    error.suite = { path: [ 'foo' ] };
    error.state = { name: 'plain' };
    error.browserId = 'firefox';

    const result = createResult('error', error, 42);
    const expectedFields = [
        'type',
        'suitePath',
        'stateName',
        'browserId',
        'referencePath',
        'imageBufferPromises',
        'error',
        'hash'
    ];

    t.deepEqual(Object.keys(result), expectedFields);
    t.is(result.type, 'error');
    t.deepEqual(result.suitePath, [ 'foo' ]);
    t.is(result.stateName, 'plain');
    t.is(result.browserId, 'firefox');
    t.is(result.referencePath, '/reference/image.png');
    t.true(readCurrent.calledOnce);
    t.true(result.imageBufferPromises.actual instanceof Promise);
    t.is(result.error.name, 'NoRefImageError');
    t.regex(result.error.message, /^Can not find reference image at/);

    readCurrent.restore();
});

test('mapping an arbitrary error', (t) => {
    const error = {
        name: 'AnyError',
        message: 'Something crashed',
        stack: 'a stacktrace',
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox'
    };

    const result = createResult('error', error, 42);
    const expectedFields = [
        'type',
        'suitePath',
        'stateName',
        'browserId',
        'referencePath',
        'error',
        'hash'
    ];

    t.deepEqual(Object.keys(result), expectedFields);
    t.is(result.type, 'error');
    t.deepEqual(result.suitePath, [ 'foo' ]);
    t.is(result.stateName, 'plain');
    t.is(result.browserId, 'firefox');
    t.is(result.referencePath, undefined);
    t.is(result.error.name, 'AnyError');
    t.is(result.error.message, 'Something crashed');
});
