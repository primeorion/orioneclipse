"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');
var util = require('util');
var UtilService = require("service/util/UtilService");
var logger = helper.logger(moduleName);
var _ = require('underscore');

var utilService = new UtilService();

var applicationEnum = config.applicationEnum;

var orderMessageShortCodes = applicationEnum.TRADE_ORDER_MESSAGE.SHORT_CODES;

var GlobalTradeConverter = function () { }

GlobalTradeConverter.prototype.getIssuesAfterPreferencesSetting = function (data, cb) {
    logger.info(" Get Issues After Preferences Setting  List data (getIssuesAfterPreferencesSetting())");
    var valid = [];
    var inValid = [];
    if (data) {
        data.forEach(function (preference) {
            var validData = {};
            var invValidData = {};

            if (preference.isValid === true) {
                validData.accountId = preference.accountId ? preference.accountId : null;
                validData.sellSecurityId = preference.sellSecurityId ? preference.sellSecurityId : null;
                validData.price = preference.price ? preference.price : null;
                validData.buySecurityId = preference.buySecurityId ? preference.buySecurityId : null;
                validData.percent = preference.percent ? preference.percent : null;
                validData.totalSellQty = preference.totalSellQty ? preference.totalSellQty : null;
                validData.totalSellPrice = preference.totalSellPrice ? preference.totalSellPrice : null;
                validData.actualSellPrice = preference.actualSellPrice ? preference.actualSellPrice : null;
                validData.actualBuyPrice = preference.actualBuyPrice ? preference.actualBuyPrice : null;
                validData.custodianId = preference.custodianId ? preference.custodianId : null;
                validData.portfolioId = preference.portfolioId ? preference.portfolioId : null;
                validData.positionId = preference.positionId ? preference.positionId : null;
                validData.modelId = preference.modelId ? preference.modelId : null;
                validData.advisorId = preference.advisorId ? preference.advisorId : null;

                validData.sma = preference.sma ? preference.sma : null;
                validData.smaTradeable = preference.smaTradeable ? preference.smaTradeable : null;

                valid.push(validData);
            } else {
                invValidData = preference.issues[0] ? preference.issues[0] : null;
                inValid.push(invValidData);
            }

        }, this);
    }
    return cb(null, valid, inValid);
};

GlobalTradeConverter.prototype.getSecurityPriceResponse = function (buyTradeValid, securityPrice, cb) {
    logger.info("Get security price Response list Data (getSecurityPriceResponse()) ");
    var outPut = [];
    _.filter(buyTradeValid, function (input) {
        _.filter(securityPrice, function (fetched) {
            if (input.buySecurityId == fetched.buySecurityId) {
                var finalOutPut = _.extend(fetched, input);
                outPut.push(finalOutPut);
            }
        });
    });
    return cb(null, outPut);
};

GlobalTradeConverter.prototype.breakSellAndBuyTrade = function (data, cb) {
    logger.info(" Break Sell And Buy Trade List data (breakSellAndBuyTrade())");
    var tradeList = [];
    if (data) {
        data.forEach(function (trade) {
            if (trade.sellSecurityId) {
                var tradeSellData = {};
                var tradeOrderMessageFirst = {};
                tradeSellData.accountId = trade.accountId ? trade.accountId : null;
                tradeSellData.securityId = trade.sellSecurityId ? trade.sellSecurityId : null;
                tradeSellData.price = trade.price ? trade.price : null;
                tradeSellData.tradeAmount = trade.actualSellPrice ? trade.actualSellPrice : null;
                tradeSellData.orderQty = trade.totalSellQty ? trade.totalSellQty : null;
                //tradeSellData.percent = trade.percent ? trade.percent : null;
                tradeSellData.orderPercent = trade.percent ? trade.percent : null;
                tradeSellData.accountValue = trade.accountValue ? trade.accountValue : null;
                tradeSellData.tradeActionId = 2;
                // tradeSellData.custodianId = 65;
                tradeSellData.custodianId = trade.custodianId ? trade.custodianId : null;
                tradeSellData.portfolioId = trade.portfolioId ? trade.portfolioId : null;
                tradeSellData.positionId = trade.positionId ? trade.positionId : null;
                tradeSellData.modelId = trade.modelId ? trade.modelId : null;
                tradeSellData.advisorId = trade.advisorId ? trade.advisorId : null;
                tradeSellData.cashValuePostTrade = trade.cashValuePostTrade ? trade.cashValuePostTrade : null;

                if (trade.sma === 1 && parseInt(trade.smaTradeable) === 0) {
                    tradeSellData.isEnabled = 0;
                    tradeOrderMessageFirst.shortCode = orderMessageShortCodes.SMA_ACCOUNT;
                    tradeOrderMessageFirst.arguments = null;
                    trade.sellTradeOrderMessage.push(tradeOrderMessageFirst);
                } else {
                    tradeSellData.isEnabled = 1;
                }
                tradeSellData.isSendImmediately = 0;
                if (trade.price === 0) {
                    tradeOrderMessageFirst.shortCode = orderMessageShortCodes.PRODUCT_ZERO_PRICE;
                    tradeOrderMessageFirst.arguments = 0;
                    // trade.sellTradeOrderMessage = [];
                    trade.sellTradeOrderMessage.push(tradeOrderMessageFirst);
                }
                tradeSellData.tradeOrderMessages = trade.sellTradeOrderMessage ? trade.sellTradeOrderMessage : [];

                tradeList.push(tradeSellData);
            }
            if (trade.buySecurityId) {
                var tradeBuyData = {};
                var actualBuyPrice = trade.actualBuyPrice;
                var buyPrice = trade.buyPrice;
                var qty = actualBuyPrice / buyPrice;

                tradeBuyData.accountId = trade.accountId ? trade.accountId : null;
                tradeBuyData.securityId = trade.buySecurityId ? trade.buySecurityId : null;
                tradeBuyData.price = trade.price ? trade.price : null;
                tradeBuyData.tradeAmount = trade.actualSellPrice ? trade.actualSellPrice : null;
                //tradeBuyData.percent = trade.percent ? trade.percent : null;
                tradeBuyData.orderPercent = trade.percent ? trade.percent : null;
                tradeBuyData.accountValue = trade.accountValue ? trade.accountValue : null;
                tradeBuyData.orderQty = qty;

                tradeBuyData.tradeActionId = 1;
                // tradeBuyData.custodianId = 65;
                tradeBuyData.custodianId = trade.custodianId ? trade.custodianId : null;
                tradeBuyData.portfolioId = trade.portfolioId ? trade.portfolioId : null;
                tradeBuyData.positionId = trade.positionId ? trade.positionId : null;
                tradeBuyData.modelId = trade.modelId ? trade.modelId : null;
                tradeBuyData.advisorId = trade.advisorId ? trade.advisorId : null;
                tradeBuyData.cashValuePostTrade = trade.cashValuePostTrade ? trade.cashValuePostTrade : null;

                // tradeBuyData.sma = trade.sma ? trade.sma : null;
                if (trade.sma === 1 && parseInt(trade.smaTradeable) === 0) {
                    tradeBuyData.isEnabled = 0;
                    tradeOrderMessageFirst.shortCode = orderMessageShortCodes.SMA_ACCOUNT;
                    tradeOrderMessageFirst.arguments = null;
                    trade.buyTradeOrderMessage.push(tradeOrderMessageFirst);
                } else {
                    tradeBuyData.isEnabled = 1;
                }
                tradeBuyData.isSendImmediately = 0;
                if (trade.price === 0) {
                    tradeOrderMessageFirst.shortCode = orderMessageShortCodes.PRODUCT_ZERO_PRICE;
                    tradeOrderMessageFirst.arguments = 0;
                    //   trade.buyTradeOrderMessage = [];
                    trade.buyTradeOrderMessage.push(tradeOrderMessageFirst);
                }
                tradeBuyData.tradeOrderMessages = trade.buyTradeOrderMessage ? trade.buyTradeOrderMessage : [];

                tradeList.push(tradeBuyData);
            }
        }, this);
    }
    return cb(null, tradeList);
};

GlobalTradeConverter.prototype.instanceAndIssuesResponse = function (data, tradeError, cb) {
    logger.info(" Instance And Issues ResponseList data (instanceAndIssuesResponse())");
    var result = []
    var tradeErrorList = {};
    tradeErrorList.instanceId = data.instanceId ? data.instanceId : null;

    // tradeErrorList.issues = [];
    // tradeError[0].sellTradeError.forEach(function (issue) {
    //     tradeErrorList.issues.push(issue)
    // }, this);
    // tradeError[1].buyTradeError.forEach(function (issue) {
    //     tradeErrorList.issues.push(issue)
    // }, this);
    tradeErrorList.issues = [];
    tradeError.forEach(function (issue) {
        tradeErrorList.issues.push(issue)
    }, this);
    return cb(null, tradeErrorList);
};

GlobalTradeConverter.prototype.sellAndBuyTradeListResponse = function (data, cb) {
    logger.info(" Sell And Buy Trade List Response List data (sellAndBuyTradeListResponse())");
    var tradeList = [];
    var inValid = [];
    if (data) {

        data.forEach(function (trade) {
            var inValidData = {};
            var tradeOrderMessageFirst = {};
            if (trade.isValid === true) {
                if (trade.sellSecurityId) {
                    var tradeSellData = {};
                    tradeSellData.accountId = trade.accountId ? trade.accountId : null;
                    tradeSellData.securityId = trade.sellSecurityId ? trade.sellSecurityId : null;
                    tradeSellData.price = trade.price ? trade.price : 0;
                    tradeSellData.tradeAmount = trade.actualSellPrice ? trade.actualSellPrice : 0;
                    tradeSellData.orderQty = trade.quantity ? trade.quantity : 0;
                    tradeSellData.orderPercent = trade.percent ? trade.percent : null;
                    tradeSellData.accountValue = trade.accountValue ? trade.accountValue : null;
                    tradeSellData.cashValuePostTrade = trade.cashValuePostTrade ? trade.cashValuePostTrade : null;

                    tradeSellData.tradeActionId = 2;
                    tradeSellData.securityTypeId = trade.securityTypeId ? trade.securityTypeId : null;
                    // tradeSellData.isEnabled = 0;
                    tradeSellData.isSendImmediately = 0;

                    //       tradeSellData.custodianId = 65;
                    tradeSellData.custodianId = trade.custodianId ? trade.custodianId : null;
                    tradeSellData.portfolioId = trade.portfolioId ? trade.portfolioId : null;
                    tradeSellData.positionId = trade.positionId ? trade.positionId : null;
                    tradeSellData.advisorId = trade.advisorId ? trade.advisorId : null;
                    tradeSellData.modelId = trade.modelId ? trade.modelId : null;
                    if (trade.sma === 1 && parseInt(trade.smaTradeable) === 0) {
                        tradeSellData.isEnabled = 0;
                        tradeOrderMessageFirst.shortCode = orderMessageShortCodes.SMA_ACCOUNT;
                        tradeOrderMessageFirst.arguments = null;
                        trade.tradeOrderMessage.push(tradeOrderMessageFirst);
                    } else {
                        tradeSellData.isEnabled = 1;
                    }
                    // tradeSellData.tradeOrderMessages = [];
                    if (trade.price === 0) {
                        tradeOrderMessageFirst.shortCode = orderMessageShortCodes.PRODUCT_ZERO_PRICE;
                        tradeOrderMessageFirst.arguments = 0;
                        trade.tradeOrderMessage.push(tradeOrderMessageFirst);
                    }
                    tradeSellData.tradeOrderMessages = trade.tradeOrderMessage ? trade.tradeOrderMessage : null;

                    tradeList.push(tradeSellData);
                }
                if (trade.buySecurityId) {
                    var tradeBuyData = {};
                    tradeBuyData.accountId = trade.accountId ? trade.accountId : null;
                    tradeBuyData.securityId = trade.buySecurityId ? trade.buySecurityId : null;
                    tradeBuyData.price = trade.price ? trade.price : 0;
                    tradeBuyData.tradeAmount = trade.actualBuyPrice ? trade.actualBuyPrice : 0;
                    tradeBuyData.orderQty = trade.quantity ? trade.quantity : 0;
                    tradeBuyData.orderPercent = trade.percent ? trade.percent : null;
                    tradeBuyData.accountValue = trade.accountValue ? trade.accountValue : null;
                    tradeBuyData.cashValuePostTrade = trade.cashValuePostTrade ? trade.cashValuePostTrade : null;

                    tradeBuyData.tradeActionId = 1;
                    // tradeBuyData.custodianId = 65;
                    tradeBuyData.securityTypeId = trade.securityTypeId ? trade.securityTypeId : null;
                    //  tradeBuyData.isEnabled = 0;
                    tradeBuyData.isSendImmediately = 0;
                    tradeBuyData.custodianId = trade.custodianId ? trade.custodianId : null;
                    tradeBuyData.portfolioId = trade.portfolioId ? trade.portfolioId : null;
                    tradeBuyData.positionId = trade.positionId ? trade.positionId : null;
                    tradeBuyData.advisorId = trade.advisorId ? trade.advisorId : null;
                    tradeBuyData.modelId = trade.modelId ? trade.modelId : null;
                    if (trade.sma === 1 && parseInt(trade.smaTradeable) === 0) {
                        tradeBuyData.isEnabled = 0;
                        tradeOrderMessageFirst.shortCode = orderMessageShortCodes.SMA_ACCOUNT;
                        tradeOrderMessageFirst.arguments = null;
                        trade.tradeOrderMessage.push(tradeOrderMessageFirst);
                    } else {
                        tradeBuyData.isEnabled = 1;
                    }
                    if (trade.price === 0) {
                        tradeOrderMessageFirst.shortCode = orderMessageShortCodes.PRODUCT_ZERO_PRICE;
                        tradeOrderMessageFirst.arguments = 0;
                        trade.tradeOrderMessage.push(tradeOrderMessageFirst);
                    }
                    tradeBuyData.tradeOrderMessages = trade.tradeOrderMessage ? trade.tradeOrderMessage : null;
                    // tradeBuyData.tradeOrderMessages = [];

                    // tradeBuyData.sma = trade.sma ? trade.sma : null;
                    tradeList.push(tradeBuyData);
                }
            } else {
                inValidData = trade.issues[0] ? trade.issues[0] : null;
                inValid.push(inValidData);
            }

        }, this);
    }
   // console.log("*********tradeList******" + util.inspect(tradeList, false, null));
    return cb(null, tradeList, inValid);
};

GlobalTradeConverter.prototype.tradeResponse = function (data, cb) {
    logger.info(" Trade Response List data (tradeResponse())");
    var issues = data.issues;
    var result = {};
    result.instanceId = data.instanceId ? data.instanceId : null;
    result.issues = [];
    issues.forEach(function (issue) {
        var tradeError = {};
        tradeError.accountId = issue.accountId ? issue.accountId : null;
        tradeError.message = issue.message ? issue.message : null;
        result.issues.push(issue);
    }, this);
    return cb(null, result);
};

module.exports = GlobalTradeConverter;
