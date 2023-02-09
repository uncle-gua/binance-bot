'use strict';
const url = require('url');

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function normalize(raw, prefix = false, surfix = false, lowercase = true, uppercase = false) {
    let s = url.parse(raw.trim()).pathname.replace(/(^\/*)|(\/*$)/g, '');
    if (typeof prefix == 'string') {
        s = prefix + s;
    } else {
        if (prefix) {
            s = '/' + s;
        }
    }

    if (typeof surfix == 'string') {
        s = s + surfix;
    } else {
        if (surfix) {
            s = s + '/';
        }
    }

    if (lowercase) {
        s = s.toLowerCase();
    } else {
        if (uppercase) {
            s = s.toUpperCase();
        }
    }

    return s;
}

function getMargin (origPrice, quantity, leverage) {
    return Number(origPrice) * Number(quantity) / Number(leverage);
}

function getPNL (positionSide, origPrice, markPrice, quantity) {
    let pnl = (Number(markPrice) - Number(origPrice)) * Number(quantity);
    if (positionSide == 'SHORT') {
        pnl = -pnl;
    }
    return pnl;
}

function getROE (positionSide, origPrice, markPrice, leverage) {
    let pnl = (Number(markPrice) - Number(origPrice));
    if (positionSide == 'SHORT') {
        pnl = -pnl;
    }

    let margin = Number(origPrice) / Number(leverage);

    return pnl / margin;
}

function getPriceByROE (positionSide, origPrice, leverage, roe) {
    let n = Number(origPrice) / Number(leverage) * Number(roe);

    return positionSide == 'LONG' ? Number(origPrice) + n : Number(origPrice) - n;
}

module.exports = {
    normalize,
    sleep,
    getMargin,
    getPNL,
    getROE,
    getPriceByROE
};