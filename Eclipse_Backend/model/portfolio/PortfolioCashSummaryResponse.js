

"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {

    this.portfolioCashSummary = {
        id: null,
        portfolioName: null,
        modelName: null,
        totalTradeCost: null,
        totalRedemptionFee: null,
        totalValue: null,
        currentValue: null,
        reserveValue: null,
        excludedValue: null,
        setAsideValue: null,
        targetValue: null,
        postTradeValue: null,
        needsValue: null
    };
    this.accountCashSummary = []

    return lodash.assignIn(this);
};

