'use strict';

const logger = require('../lib/logger');

module.exports = async function (ctx, next) {
    try {
        let env = ctx.app.env;
        ctx.error = (code, message) => {
            logger.error('internal error: ' + message);
            if (typeof code === 'string') {
                message = code;
                code = 500;
            }
            ctx.throw(code || 500, message || 'internal server error');
        };
        await next();
    } catch (e) {
        let status = e.status || 500;
        let message = ctx.app.env == 'product' ? 'internal server error' : e.message || 'internal server error';
        ctx.body = { status, message };
        ctx.app.emit('error', e, ctx);
    }
}
