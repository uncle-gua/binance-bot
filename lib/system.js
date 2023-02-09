'use strict';

const moment = require('moment');
const logger = require('./logger');
const models = require('../models');

module.exports = {
    init: async () => {
        let configCount = await models.Config.count({});
        if (configCount == 0) {
            let config = new models.Config({
                assetVersion: moment().utc().format('YYYYMMDD'),
                logLevel: 'DEBUG',
                petty: 0.0001,
                precision: 4,
                siteName: 'Binance Trade Bot',
                serverName: "001",
            });
            config.save().catch(err => {
                logger.error(err);
            });
        }
        let userCount = await models.User.count({});
        if (userCount == 0) {
            let admin = new models.User({
                role:       "Admin",
                name:       "Administrator",
                username:   "admin",
                password:   "admin" + moment().utc().format('YYYYMMDD'),
                apiKey:     "",
                apiSecret:  "",
                scale:      1.0,
                riskLevel1: 2.0,
                riskLevel2: 4.0,
                status:     'Enable',
            });
            admin.save({
                validateBeforeSave: false
            }).catch(err => {
                logger.error(err);
            });
        }
    }
}
