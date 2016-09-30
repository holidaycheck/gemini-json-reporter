'use strict';

const crypto = require('crypto');

module.exports = function createResultHash(result, timestamp) {
    const value = `${timestamp}${result.suitePath.join('')}${result.browserId}${result.stateName}${result.type}`;

    return crypto.createHash('sha256').update(value).digest('hex');
};
