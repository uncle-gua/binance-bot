'use strict';

const path = require('path');
const statics = require('koa-static-cache');
const utils = require('../utils');
const models = require('../models');

module.exports = async function (ctx, next) {
    const whiteList = ['::1', '127.0.0.1', '52.89.214.238', '34.212.75.30', '54.218.53.128', '52.32.178.7', '202.43.232.187'];
    let ip = ctx.request.ip.replace(/^::ffff:/gm, '');
    if (whiteList.includes(ip)) {
        await next();
        return;
    }

    ctx.response.status = 403;
    ctx.response.body = 'Forbidden';
}
