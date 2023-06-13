'use strict';

const Router = require('koa-router');
const models = require('../../models');
const logger = require('../../lib/logger');
const positions = require('../../lib/positions');
const whitelist = require('../../middleware/whitelist');

const tv = new Router();

tv.use(whitelist);

const errorHandler = err => {
    logger.error(err);
}

const trimSymbol = symbol => {
    let n = symbol.split(":");
    symbol = n.length > 1 ? n[1] : n[0];
    symbol = symbol.substr('-2').toUpperCase() == '.P' ? symbol.substr(0, symbol.length - 2) : symbol;
    return symbol.toUpperCase();
}

tv.post('/:token', async (ctx) => {
    const { token } = ctx.params;
    models.User.findOne({token}).then(user => {
        if (!user) {
            throw "Invalid user id";
        }
        let userId = user._id;
        let { action, symbol, side, size, comment } = ctx.request.body;
        symbol = symbol ? trimSymbol(symbol) : symbol;
        const command = new models.Command({
            userId,
            action,
            symbol,
            side,
            size,
            quantity: size * user.scale,
            comment
        });
        command.save().then((command) => {
            positions.exec(user, command).catch(errorHandler);
        }).catch(errorHandler);
    }).catch(errorHandler);

    ctx.response.body = "ok";
});

module.exports = tv;
