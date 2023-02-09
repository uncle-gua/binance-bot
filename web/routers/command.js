'use strict';

const Router = require('koa-router');
const querystring = require('querystring');
const models = require('../../models');
const logger = require('../../lib/logger');
const command = new Router();

command.get('/', async (ctx) => {
    let user = ctx.state.user;
    let count = await models.Command.countDocuments({userId: user._id});

    let params = querystring.parse(ctx.request.url.substr(ctx.request.url.indexOf("?") + 1));
    let limit = Number(params.limit) > 0 ? Number(params.limit) : 10;
    let pages = count == 0 ? 1 : Math.ceil(count / limit);
    let page = Math.min(Number(params.page) > 0 ? Number(params.page) : 1, pages);
    let items = await models.Command.find({userId: user._id}).sort({createdAt: -1}).limit(limit).skip((page - 1) * limit);
    await ctx.render('command/index', {
        items,
        count,
        page,
        limit,
    });
});

module.exports = command;
