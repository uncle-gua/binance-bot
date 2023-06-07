'use strict';

const Binance = require('node-binance-api');
const models = require('../models');
const symbols = require('./symbols');
const logger = require('./logger');

const getClient = (user) => {
    return new Binance().options({
        APIKEY: user.apiKey,
        APISECRET: user.apiSecret,
        hedgeMode: true
    });
}

const positions = {
    get: async (user) => {
        let client = getClient(user);
        let data = await client.futuresAccount();
        data.amount = function(symbol, side) {
            let zero = symbols.zero(symbol);
            for (let p of this.positions) {
                if (p.symbol == symbol && p.positionSide == side) {
                    return p.positionAmt;
                }
            }
            return zero;
        }
        data.hold = function(symbol, side) {
            let zero = symbols.zero(symbol);
            let amount = this.amount(symbol, side);
            return amount != zero;
        };
        data.empty = function(symbol, side) {
            return !this.hold(symbol, side);
        };
        data.risk = function(quantity, price) {
            return (this.totalMaintMargin * 100 + quantity * price) / this.totalMarginBalance;
        };
        data.buy = function(command) {
            let tradeAction = command.side == 'LONG' ? client.futuresMarketBuy : client.futuresMarketSell;
            let precision = symbols.precision(command.symbol);

            tradeAction(command.symbol, command.quantity.toFixed(precision)).then(
                order => {
                    if (order.orderId) {
                        command.success();
                    } else {
                        command.failed(order.msg);
                    }
                }, reason => {
                    logger.error(reason);
                    command.failed(reason);
                }
            ).catch(err => {
                logger.error(err);
                command.failed();
            });
        };
        data.sell = function(command) {
            let precision = symbols.precision(command.symbol);
            client.futuresOrder(
                command.side == 'LONG' ? 'SELL' : 'BUY',
                command.symbol,
                command.quantity.toFixed(precision),
                false,
                {
                    positionSide: command.side,
                }
            ).then(
                order => {
                    if (order.orderId) {
                        command.success();
                    } else {
                        command.failed(order.msg);
                    }
                },
                reason => {
                    logger.error(reason);
                    command.failed(reason);
                }
            ).catch(err => {
                logger.error(err);
                command.failed();
            });
        }
        return data;
    },
    exec: async (user, command) => {
        switch (command.action) {
            case 'OPEN':
                positions.get(user).then(position => {
                    if (position.hold(command.symbol, command.side)) {
                        command.failed('position hold');
                        return;
                    }
                    let side = command.side == 'LONG' ? 'SHORT' : 'LONG';
                    if (position.hold(command.symbol, side)) {
                        let amount = position.amount(command.symbol, side);
                        position.sell(new models.Command({
                            userId: user._id,
                            action: 'CLOSE',
                            side: side,
                            symbol: command.symbol,
                            quantity: Math.abs(amount),
                            scale: 1.0,
                            comment: "reverse"
                        }));
                    }
                    let client = getClient(user);
                    client.futuresPrices({symbol: command.symbol}).then(ticker => {
                        let risk = position.risk(command.quantity, ticker.price);
                        if (risk > user.riskLevel1) {
                            command.failed('position risk');
                            return;
                        }
                        position.buy(command);
                    });
                }).catch(err => {
                    logger.error(err);
                    command.failed(err.message);
                });
                break;
            case 'CLOSE':
                positions.get(user).then(position => {
                    if (position.empty(command.symbol, command.side)) {
                        command.failed('position empty');
                        return;
                    }
                    let amount = position.amount(command.symbol, command.side);
                    command.quantity = Math.abs(amount);
                    position.sell(command);
                }).catch(err => {
                    logger.error(err);
                    command.failed(err.message);
                });
                break;
            case 'INCR':
                positions.get(user).then(position => {
                    if (position.empty(command.symbol, command.side)) {
                        command.failed('position empty');
                        return;
                    }
                    let client = getClient(user);
                    client.futuresPrices({symbol: command.symbol}).then(ticker => {
                        let risk = position.risk(command.quantity, ticker.price);
                        if (risk > user.riskLevel2) {
                            command.failed('position risk');
                            return;
                        }
                        position.buy(command);
                    });
                }).catch(err => {
                    logger.error(err);
                    command.failed(err.message);
                });
                break;
            case 'DECR':
                positions.get(user).then(position => {
                    if (position.empty(command.symbol, command.side)) {
                        command.failed('position empty');
                        return;
                    }
                    let amount = position.amount(command.symbol, command.side);
                    if (Math.abs(amount) < command.quantity) {
                        command.quantity = Math.abs(amount);
                    }
                    position.sell(command);
                }).catch(err => {
                    logger.error(err);
                    command.failed(err.message);
                });
                break;
        }
    }
}

module.exports = positions;
