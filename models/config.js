'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Config = new Schema({
    logLevel:       {type: String, required: true, enum:['ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'MARK', 'OFF']},
    assetVersion:   {type: String, required: true},
    siteName:       {type: String, required: true},
    serverName:     {type: String, required: true},
    petty:          {type: Number, min: 0},
    precision:      {type: Number, min: 0}
});

Config.statics.get = async function(key, def) {
    let data = await this.findOne({}) || {};

    if (!key) {
        return data;
    }

    if (data && data[key]) {
        return data[key];
    }

    return def || null;
}

module.exports = mongoose.model('Configs', Config);
