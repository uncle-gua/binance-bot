'use strict';

const Router = require('koa-router');
const home = require('./home');
const user = require('./user');
const account = require('./account');
const command = require('./command');
const captcha = require('./captcha');
const profile = require('./profile');
const config = require('./config');
const tv = require('./tv');

const router = new Router();

router.get('/', ctx => {
    ctx.redirect('/home');
});

router.use('/account', account.routes(), account.allowedMethods());
router.use('/captcha', captcha.routes(), captcha.allowedMethods());
router.use('/command', command.routes(), command.allowedMethods());
router.use('/profile', profile.routes(), profile.allowedMethods());
router.use('/config', config.routes(), config.allowedMethods());
router.use('/home', home.routes(), home.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/tv', tv.routes(), tv.allowedMethods());

module.exports = router;
