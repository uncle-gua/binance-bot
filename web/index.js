'use strict';

const Koa = require('koa');
const path = require('path');
const moment = require('moment');
const statics = require('koa-static-cache');
const koaJson = require('koa-json');
const koaBodyParser = require('koa-bodyparser');
const views = require('koa-views');
const session = require('koa-session2');

const db = require('../lib/db');
const logger = require('../lib/logger');

const intercept = require('../middleware/intercept');
const recover = require('../middleware/recover');
const store = require('../middleware/store');

const models = require('../models');

const routers = require('./routers');

const CONFIG = {
    key: 'koa-session',
    maxAge: 3600000,
    store: new store(db.connection)
}

const web = {
    start: function (port) {
        return new Promise((resolve, reject) => {
            try {
                port = port ? port : 80;

                const app = new Koa({
                    env: 'product',
                    proxy: true
                });

                app.use(recover);

                app.use(statics(
                    path.join(__dirname, 'static'), {
                        maxAge: 365 * 24 * 60 * 60
                    }
                ));

                app.use(views(path.join(__dirname, 'views'), {
                    extension: 'ejs',
                }));

                app.use(session(CONFIG));

                app.use(koaBodyParser());

                app.use(koaJson());

                app.use(intercept);

                app.use(async (ctx, next) => {
                    let config = await models.Config.get();

                    ctx.state.config = config;
                    ctx.state.moment = moment;

                    await next()
                });

                app.use(routers.routes());

                app.listen(port);

                logger.info('Server listen on port: ' + port);

                resolve(port);
            } catch (ex) {
                reject(ex);
            }
        });
    }
}

module.exports = web;
