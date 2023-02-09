'use strict';

const log4js = require('log4js');
const models = require('../models');

const config = {
    "appenders": {
        "consoleout": {
            "type": "console"
        }
    },
    "categories": {
        "default": {
            "appenders": ["consoleout"],
            "level": "debug"
        }
    }
}

log4js.configure(config);

let logger = log4js.getLogger();

(async () => {
    let level = await models.Config.get('logLevel', 'DEBUG');
    logger.level = level;
})();

module.exports = logger;
