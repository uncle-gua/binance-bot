'use strict';

const Router = require('koa-router');
const querystring = require('querystring');
const models = require('../../models');
const logger = require('../../lib/logger');
const account = new Router();
const nanoid = require('nanoid').customAlphabet('1234567890abcdef', 10);

account.get('/', async (ctx) => {
    let user = ctx.state.user;
    let count = await models.User.countDocuments();

    let params = querystring.parse(ctx.request.url.substr(ctx.request.url.indexOf("?") + 1));
    let limit = Number(params.limit) > 0 ? Number(params.limit) : 10;
    let pages = count == 0 ? 1 : Math.ceil(count / limit);
    let page = Math.min(Number(params.page) > 0 ? Number(params.page) : 1, pages);

    let items = await models.User.find().sort({createdAt: -1}).limit(limit).skip((page - 1) * limit);
    await ctx.render('account/index', {
        items,
        count,
        page,
        limit,
    });
});

account.get('/add', async (ctx) => {
    await ctx.render('account/add');
});

account.post('/save', async (ctx) => {
    try {
        let { name, username, role, password, apiKey, apiSecret, scale, riskLevel1, riskLevel2, status } = ctx.request.body;
        let user = new models.User({
            token: nanoid(),
            name,
            username,
            role,
            password,
            apiKey,
            apiSecret,
            scale,
            riskLevel1,
            riskLevel2,
            status
        });
        await user.save();
        ctx.body = {
            code: 0,
            msg: 'Account save successful.',
            url: '/account'
        };
    } catch (err) {
        logger.error(err);
        ctx.body = {
            code: 1,
            msg: err.message
        };
    }
});

account.get('/edit/:id', async (ctx) => {
    let id = ctx.params.id;
    let item = await models.User.findById(id);
    await ctx.render('account/edit', {item});
});

account.post('/update/:id', async (ctx) => {
    try {
        let id = ctx.params.id;
        let { name, username, role, password, apiKey, apiSecret, scale, riskLevel1, riskLevel2, status } = ctx.request.body;
        let update = {
            $set: {
                name,
                username,
                role,
                apiKey,
                apiSecret,
                scale,
                riskLevel1,
                riskLevel2,
                status
            }
        }
        if (password) {
            update.$set.password = password;
        }
        await models.User.findOneAndUpdate({
            _id: id
        }, update, { runValidators: true });
        ctx.body = {
            code: 0,
            msg: 'Account save successful.',
            url: '/account'
        };
    } catch (err) {
        logger.error(err);
        ctx.body = {
            code: 1,
            msg: err.message
        };
    }
});

module.exports = account;
