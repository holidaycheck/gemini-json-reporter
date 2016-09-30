'use strict';

const determineAbsolutePath = require('../../lib/determineAbsolutePath');
const test = require('ava');

test('returns the path as is when it already is an absolute path', (t) => {
    t.is(determineAbsolutePath('/foo/bar', '/cwd'), '/foo/bar');
});

test('resolves the path to the given cwd path when path is relative', (t) => {
    t.is(determineAbsolutePath('./bar', '/cwd'), '/cwd/bar');
});
