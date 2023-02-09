'use strict';

const db = require('./lib/db');
const system = require('./lib/system');
const symbols = require('./lib/symbols');
const web = require('./web');
const logger = require('./lib/logger');

(async () => {
    process.on('unhandledRejection', (reason, p) => {
        logger.error('Unhandled Rejection at:', p, 'reason:', reason);
    });

    try {
        await db.connect();
        await system.init();
        await symbols.init();
        await web.start(80);
    } catch (err) {
        logger.fatal(err);
    }
})();
