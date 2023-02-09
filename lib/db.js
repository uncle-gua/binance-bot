'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = {
    connect: async () => {
        let address = 'mongodb://127.0.0.1:27017/binance-bot';
        let options = {
            useUnifiedTopology: true,
            useNewUrlParser: true
        };

        mongoose.connection.on('connected', () => {
            logger.info('mongodb connection opened');
        });

        mongoose.connection.on('error', err => {
            logger.error('mongodb connection error: ' + err.toString());
        });

        mongoose.connection.on('disconnected', () => {
            logger.info('mongodb connection disconnected');
        });

        await mongoose.connect(address, options);
    },
    connection: mongoose.connection
}
