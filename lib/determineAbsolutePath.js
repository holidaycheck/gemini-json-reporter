'use strict';

const path = require('path');

module.exports = function determineAbsolutePath(maybeAbsolutePath, cwd) {
    if (path.isAbsolute(maybeAbsolutePath)) {
        return maybeAbsolutePath;
    }

    return path.join(cwd, maybeAbsolutePath);
};
