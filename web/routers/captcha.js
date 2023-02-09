'use strict';

const Router = require('koa-router');
const Captchapng = require('captchapng');

const captcha = new Router();

captcha.get('/', async (ctx) => {
    const cap = parseInt(Math.random() * 9000 + 1000);
    const p = new Captchapng(140, 32, cap);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);
    const base64 = p.getBase64();
    var img = Buffer.from(base64, 'base64');

    ctx.session.verify = cap;

    ctx.response.set('Content-Type', 'image/png');

    ctx.response.body = img;
});

module.exports = captcha;