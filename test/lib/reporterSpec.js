'use strict';

const reporter = require('../../lib/reporter');
const test = require('ava');
const sinon = require('sinon');
const fs = require('fs');
const QEmitter = require('qemitter');
const runnerEvents = require('gemini/lib/constants/runner-events');

test.beforeEach((t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.writeFile = sinon.stub(fs, 'writeFile').yields(null);
});

test.afterEach((t) => {
    t.context.writeFile.restore();
});

test.serial('writes all results to the default report file location', (t) => {
    const gemini = new QEmitter();
    const runner = new QEmitter();
    const cwd = sinon.stub(process, 'cwd').returns('/cwd');
    const geminiResult = {
        equal: true,
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox',
        referencePath: '/reference/image.png'
    };

    reporter(gemini);

    gemini.emit('startRunner', runner);
    runner.emit(runnerEvents.TEST_RESULT, geminiResult);

    return gemini.emitAndWait('endRunner')
        .then(() => {
            t.true(t.context.writeFile.calledOnce);
            t.true(t.context.writeFile.calledWithMatch('/cwd/report.json', 'firefox'));

            cwd.restore();
        });
});

test.serial('writes error results', (t) => {
    const gemini = new QEmitter();
    const runner = new QEmitter();
    const error = {
        name: 'AnyError',
        message: 'crash',
        stack: 'stacktrace',
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox'
    };

    reporter(gemini);

    gemini.emit('startRunner', runner);
    runner.emit(runnerEvents.ERROR, error);

    return gemini.emitAndWait('endRunner')
        .then(() => {
            t.true(t.context.writeFile.calledOnce);
            t.true(t.context.writeFile.calledWithMatch(sinon.match.any, 'AnyError'));
        });
});

test.serial('includes the actual image as base64 encoded string', (t) => {
    const gemini = new QEmitter();
    const runner = new QEmitter();
    const buffer = { toString: sinon.stub().returns('foo') };
    const readFile = sinon.stub(fs, 'readFile');

    readFile.withArgs('/tmp/current.png').yields(null, buffer);

    const error = {
        name: 'NoRefImageError',
        message: 'no reference',
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox',
        currentPath: '/tmp/current.png'
    };

    reporter(gemini);

    gemini.emit('startRunner', runner);
    runner.emit(runnerEvents.ERROR, error);

    return gemini.emitAndWait('endRunner')
        .then(() => {
            t.true(readFile.calledOnce);
            t.true(buffer.toString.calledWithExactly('base64'));
            t.true(t.context.writeFile.calledOnce);
            t.true(t.context.writeFile.calledWithMatch(sinon.match.any, '"actual":"foo"'));

            readFile.restore();
        });
});

test.serial('includes the diff image as base64 encoded string', (t) => {
    const gemini = new QEmitter();
    const runner = new QEmitter();
    const buffer = { toString: sinon.stub().returns('foo') };
    const readFile = sinon.stub(fs, 'readFile');
    const saveDiffTo = sinon.stub().returns(Promise.resolve('bar'));

    readFile.withArgs('/tmp/current.png').yields(null, buffer);

    const geminiResult = {
        equal: false,
        suite: { path: [ 'foo' ] },
        state: { name: 'plain' },
        browserId: 'firefox',
        referencePath: '/reference/image.png',
        currentPath: '/tmp/current.png',
        saveDiffTo
    };

    reporter(gemini);

    gemini.emit('startRunner', runner);
    runner.emit(runnerEvents.TEST_RESULT, geminiResult);

    return gemini.emitAndWait('endRunner')
        .then(() => {
            t.true(saveDiffTo.calledOnce);
            t.true(t.context.writeFile.calledOnce);
            t.true(t.context.writeFile.calledWithMatch(sinon.match.any, '"diff":"bar"'));

            readFile.restore();
        });
});
