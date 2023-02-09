'use strict';

const Binance = require('node-binance-api');

const logger = require('./logger');

const getClient = () => {
    return new Binance();
};

const INTERVAL = 1000 * 60;

let data = {
    symbols: []
};

const synchronize = async () => {
    let client = getClient();
    let info = await client.futuresExchangeInfo();
    if (info.symbols) {
        data = info;
        logger.info('symbols synchronized successful');
    } else {
        logger.info('symbols synchronized failed');
    }
}

const symbols = {
    init: async () => {
        await synchronize();
        setInterval(synchronize, INTERVAL);
    },

    get keys() {
        return data.symbols.map(v => {
            return v.symbol;
        });
    },

    get: (symbol) => {
        for (let v of data.symbols) {
            if (v.symbol == symbol) return v;
        }

        throw 'Invalid symbol';
    },

    precision: (symbol, type = 'Q') => {
        if (type != 'P' && type != 'Q') {
            throw 'Precision type must be "P:Price" or "Q:Quantity"';
        }

        for (let v of data.symbols) {
            if (v.symbol == symbol) return type == 'Q' ? v.quantityPrecision : v.pricePrecision;
        }

        throw 'Invalid symbol';
    },

    zero: (symbol) => {
        let precision = symbols.precision(symbol);
        return (0.0).toFixed(precision);
    }
}

module.exports = symbols;
