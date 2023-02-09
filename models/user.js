'use strict';

const nanoid = require('nanoid').customAlphabet('1234567890abcdef', 10);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    token:          {type: String, required: true, default: nanoid()},
    name:           {type: String, required: true},
    username:       {type: String, required: true},
    password:       {type: String, required: true},
    role:           {type: String, required: true, default: 'User', enum: ['User','Admin']},
    apiKey:         {type: String, validate: {
        validator: function(v) {
            let instance = this._update && this._update.$set ? this._update.$set : this;
            return !(instance.role == 'User' && (!instance.apiKey || instance.apiKey == ''));
        },
        message: props => 'Path `apiKey` is required.'
    }},
    apiSecret:      {type: String, validate: {
        validator: function(v) {
            let instance = this._update && this._update.$set ? this._update.$set : this;
            return !(instance.role == 'User' && (!instance.apiSecret || instance.apiSecret == ''));
        },
        message: props => 'Path `apiSecret` is required.'
    }},
    scale:          {type: String, required: true, default: 1.0},
    riskLevel1:     {type: Number, required: true},
    riskLevel2:     {type: Number, required: true},
    status:         {type: String, required: true, default: 'Enable', enum: ['Enable','Disable']},
}, { timestamps: true });

User.methods.isAccount = function() {
    return this.apiKey &&
        this.apiSecret &&
        this.apiKey.trim().length > 0 &&
        this.apiSecret.trim().length;
}

module.exports = mongoose.model('Users', User);
