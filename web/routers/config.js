'use strict';

const mongoose = require('mongoose');

const Router = require('koa-router');
const models = require('../../models');
const logger = require('../../lib/logger');
const config = new Router();

config.get('/', async (ctx) => {
    await ctx.render('config/index');
});

config.post('/update', async (ctx) => {
    try {
        let { siteName, serverName } = ctx.request.body;
        let update = await models.Config.get();
        update.siteName = siteName;
        update.serverName = serverName;

        await models.Config.updateOne({
            _id: update._id
        }, update, { runValidators: true });
        ctx.body = {
            code: 0,
            msg: 'Update successful',
            url: '/config'
        };
    } catch (err) {
        logger.error(err);
        ctx.body = {
            code: 1,
            msg: err.message
        };
    }
});

module.exports = config;
