'use strict';

const path = require('path');
const statics = require('koa-static-cache');
const utils = require('../utils');
const models = require('../models');

module.exports = async function (ctx, next) {
    let pathname = utils.normalize(ctx.request.url, true);
    pathname = pathname == '/' ? '/home' : pathname;

    let paths = pathname.toLowerCase().split('/');
    if (paths.length > 1) {
        ctx.state.router = paths[1];
    }

    let freely = [
        '/static',
        '/user/login',
        '/captcha',
        '/tv'
    ];
    for (let path of freely) {
        if (pathname.indexOf(path) == 0) {
            await next();
            return;
        }
    }

    let privileges = {
        User:  ['/home', '/command', '/config', '/profile', '/user'],
        Admin: ['/home', '/command', '/config', '/profile', '/user', '/account']
    };

    const allow = (role) => {
        let privilege = privileges[role];
        for (let path of privilege) {
            if (pathname.indexOf(path) == 0) {
                return true;
            }
        }

        return false;
    }

    if (ctx.session.user) {
        let user = await models.User.findOne({_id: ctx.session.user._id});
        if (user && allow(user.role) && (user.status == 'Enable')) {
            ctx.session.refresh();
            ctx.state.user = user;
            await next();
            return;
        }
    }

    ctx.redirect('/user/login');
}
