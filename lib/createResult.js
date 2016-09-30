'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const createResultHash = require('./createResultHash');

function extractReferencePath(geminiResultOrError) {
    return geminiResultOrError.referencePath || geminiResultOrError.refImagePath;
}

module.exports = function createResult(type, geminiResultOrError, timestamp) {
    const readFile = Promise.promisify(fs.readFile);
    const result = {
        type,
        suitePath: geminiResultOrError.suite.path,
        stateName: geminiResultOrError.state.name,
        browserId: geminiResultOrError.browserId,
        referencePath: extractReferencePath(geminiResultOrError)
    };

    if (type === 'failure') {
        result.imageBufferPromises = {
            actual: readFile(geminiResultOrError.currentPath),
            diff: geminiResultOrError.saveDiffTo()
        };
    } else if (type === 'error' && geminiResultOrError.name === 'NoRefImageError') {
        result.imageBufferPromises = {
            actual: readFile(geminiResultOrError.currentPath)
        };
    }

    if (type === 'error') {
        result.error = {
            name: geminiResultOrError.name,
            message: geminiResultOrError.message,
            stack: geminiResultOrError.stack
        };
    }

    result.hash = createResultHash(result, timestamp);

    return result;
};
