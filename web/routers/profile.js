'use strict';

const mongoose = require('mongoose');

const Router = require('koa-router');
const models = require('../../models');
const logger = require('../../lib/logger');
const profile = new Router();

profile.get('/', async (ctx) => {
    let host = ctx.request.header.host;
    let token = ctx.state.user.token;
    let schema = ctx.secure ? 'https' : 'http';
    let url = `${schema}://${host}/tv/${token}`;
    await ctx.render('profile/index', {url});
});

profile.post('/update/:id', async (ctx) => {
    try {
        let id = ctx.params.id;
        let { apiKey, apiSecret, password, scale, riskLevel1, riskLevel2 } = ctx.request.body;
        let update = {
            apiKey,
            apiSecret,
            scale,
            riskLevel1,
            riskLevel2,
        };
        if (password) {
            update.password = password;
        }
        await models.User.updateOne({
            _id: id
        }, update, { runValidators: true });
        ctx.body = {
            code: 0,
            msg: 'Update successful',
            url: '/profile'
        };
    } catch (err) {
        logger.error(err);
        ctx.body = {
            code: 1,
            msg: err.message
        };
    }
});

module.exports = profile;
