'use strict';

const Router = require('koa-router');
const home = new Router();

home.get('/', async (ctx) => {
    let user = ctx.state.user;

    await ctx.render('home');
});

module.exports = home;
