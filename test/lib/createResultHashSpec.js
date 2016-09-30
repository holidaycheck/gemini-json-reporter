'use strict';

const createResultHash = require('../../lib/createResultHash');
const test = require('ava');

test('creates a SHA256 hash value based on stateName, type, browserId, suitePath and the given timestamp', (t) => {
    const result = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };

    t.is(createResultHash(result, 42), '9475bc5eba00a4ed41fc1fe6b7668c6750de1cac182f0472983ab043536a2693');
});

test('hash is different when only the timestamp differs', (t) => {
    const result = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };

    t.not(createResultHash(result, 42), createResultHash(result, 21));
});

test('hash is different when only the suitePath differs', (t) => {
    const resultA = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };
    const resultB = {
        suitePath: [ 'bar', 'foo' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };

    t.not(createResultHash(resultA, 42), createResultHash(resultB, 42));
});

test('hash is different when only the broserId differs', (t) => {
    const resultA = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };
    const resultB = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'chrome',
        stateName: 'plain',
        type: 'error'
    };

    t.not(createResultHash(resultA, 42), createResultHash(resultB, 42));
});

test('hash is different when only the stateName differs', (t) => {
    const resultA = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };
    const resultB = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'hovered',
        type: 'error'
    };

    t.not(createResultHash(resultA, 42), createResultHash(resultB, 42));
});

test('hash is different when only the type differs', (t) => {
    const resultA = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'error'
    };
    const resultB = {
        suitePath: [ 'foo', 'bar' ],
        browserId: 'firefox',
        stateName: 'plain',
        type: 'success'
    };

    t.not(createResultHash(resultA, 42), createResultHash(resultB, 42));
});
