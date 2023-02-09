'use strict';

const Store = require('koa-session2').Store;
const logger = require('../lib/logger');

module.exports = class extends Store {
    constructor(conn) {
        super();
        this.collection = conn.collection('sessions');
        logger.info("session start");
    }

    async get(sid) {
        return await this.collection.findOne({
            sid
        });
    }

    async set(session, opts) {
        try {
            if (!opts.sid) {
                opts.sid = this.getID(24);
            }
            await this.collection.findOneAndUpdate({
                sid: opts.sid
            }, {
                $set: session
            }, {
                upsert: true
            });
        } catch (error) {
            console.log(error);
        }
        return opts.sid;
    }

    async destory(sid) {
        await this.collection.findAndModify({
            sid
        }, [], {}, {
            removed: true
        });
    }
}
