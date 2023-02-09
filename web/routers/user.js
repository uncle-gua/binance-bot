'use strict';

const mongoose = require('mongoose');

const Router = require('koa-router');
const models = require('../../models');
const logger = require('../../lib/logger');
const user = new Router();

user.get('/login', async (ctx) => {
    await ctx.render('user/login');
});

user.post('/login', async (ctx) => {
    try {
        let { username, password, verify } = ctx.request.body;
        if (verify != ctx.session.verify) {
            ctx.response.body = {
                code: 1,
                msg: 'Incorrect captcha',
            }
            return;
        }

        let user = await models.User.findOne({
            username: username,
            password: password,
        });

        if (!user) {
            ctx.response.body = {
                code: 1,
                msg: 'Login failed'
            }
            return;
        }

        if (user.status == 'Disable') {
            ctx.response.body = {
                code: 1,
                msg: 'User disabled'
            }
            return;
        }

        ctx.session.user = user;
        ctx.response.body = {
            code: 0,
            msg: 'Login successful',
            url: '/'
        }
    } catch (err) {
        logger.error(err);
        ctx.body = {
            code: 1,
            msg: err.message
        };
    }
});

user.get('/logout', async (ctx) => {
    if (ctx.session) {
        ctx.session = null;
    }

    ctx.response.body = {
        code: 0,
        msg: 'Logout successful',
        url: '/user/login'
    }
});

module.exports = user;
