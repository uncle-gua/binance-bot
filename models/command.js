'use strict';

const mongoose = require('mongoose');
const logger = require('../lib/logger');
const Schema = mongoose.Schema;

const Command = new Schema({
    userId:         {type: Schema.ObjectId},
    action:         {type: String, required: true, enum:['OPEN','CLOSE','INCR','DECR']},
    side:           {type: String, required: true, enum:['LONG','SHORT']},
    symbol:         {type: String, required: true},
    size:           {type: Number, required: true},
    quantity:       {type: Number, required: true},
    comment:        {type: String},
    status:         {type: String, required: true, default: 'NEW', enum:['NEW','SUCCESS','FAILED']},
    reason:         {type: String, default: ''}
}, { timestamps: true });

Command.methods.success = function (reason = '') {
    this.status = 'SUCCESS';
    this.reason = reason;
    this.save().catch(err => {
        logger.error(err);
    });
};

Command.methods.failed = function (reason = '') {
    this.status = 'FAILED';
    this.reason = reason;
    this.save().catch(err => {
        logger.error(err);
    });
};

module.exports = mongoose.model('Commands', Command);
