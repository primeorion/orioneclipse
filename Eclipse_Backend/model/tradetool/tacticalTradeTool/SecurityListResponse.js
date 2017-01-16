

"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.securityName = null;

    this.tradeOrderAction = null;
    this.tradeOrderShares = null;
    this.tradeOrderRedemptionFee = null;
    this.tradeCost = null;
    this.tradeOrderAmount = null;
    this.tradeOrderPrice = null;
    this.tradeOrderHoldUntil = null;

    this.postTradeShares = null;
    this.postTradeAmount = null;
    this.postTradePer = null;

    this.modelTargetShares = null;
    this.modelTargetAmount = null;
    this.modelTargetPer = null;

    this.currentShares = null;
    this.currentAmount = null;
    this.currentPer = null;

    this.gainLossCostShortTerm = null;
    this.gainLossCostLongTerm = null;
    this.gainAmount = null;
    this.gainPer = null;
    this.tradeGain = null;

    this.commentsTradeReason = null;
    this.commentsMessage = null;
    this.isSMA = null;

    return lodash.assignIn(this);
};