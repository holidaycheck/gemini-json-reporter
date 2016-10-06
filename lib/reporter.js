'use strict';

const events = require('gemini/lib/constants/events');
const Promise = require('bluebird');
const fs = require('fs');
const determineAbsolutePath = require('./determineAbsolutePath');
const R = require('ramda');
const createResult = require('./createResult');

module.exports = function reportJson(gemini, { reportFile = 'report.json' } = {}) {
    const testResults = [];
    const reportPath = determineAbsolutePath(reportFile, process.cwd());

    gemini.on('startRunner', function registerRunnerEvents(runner) {
        runner.on(events.TEST_RESULT, function (geminiResult) {
            const type = geminiResult.equal ? 'success' : 'failure';
            const timestamp = Date.now();

            testResults.push(createResult(type, geminiResult, timestamp));
        });

        runner.on(events.ERROR, function (error) {
            const type = 'error';
            const timestamp = Date.now();

            testResults.push(createResult(type, error, timestamp));
        });
    });

    gemini.on('endRunner', function () {
        const writeFile = Promise.promisify(fs.writeFile);

        return Promise.map(testResults, (result) => {
            if (result.imageBufferPromises) {
                return Promise.props(result.imageBufferPromises)
                    .then(({ actual, diff }) => {
                        const images = {
                            actual: actual.toString('base64'),
                            diff: diff ? diff.toString('base64') : undefined
                        };

                        return R.omit([ 'imageBufferPromises' ], R.assoc('images', images, result));
                    });
            }

            return result;
        })
        .then((report) => {
            return writeFile(reportPath, JSON.stringify(report));
        });
    });
};
