
"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.dateTime = null;
    this.value = { total: null, changeValueAmount: null, changeValuePercent: null };
    this.accounts = { total: null, existing: null, new: null };
    this.issues = { total: null, errors: null, warnings: null };
    this.bars = {
        systematic: null, accountWithMergeIn: null, accountWithMergeOut: null,
        newAccount: null, accountWithNoPortfolio: null, toDo: null,
        sma: null, accountWithDataError: null, accountWithPedingTrades: null,
    };

    return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
};