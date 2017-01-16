
"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.dateTime = null;
    this.value = {
        total: null,
        changeValueAmount: null,
        changeValuePercent: null,
        status: null
    };
    this.holdings = {
        total: null,
        existing: null,
        new: null
    };
    this.issues = {
        total: null,
        errors: null,
        warnings: null
    };
    this.bars = {
        //  all: null,
        exclude: null,
        notInModel: null,
    };
    this.topTenHoldings = {
        totalHoldingValue: null,
        totalHoldingValueStatus: null,
        holdings: []
    };

    return lodash.assignIn(this);
};