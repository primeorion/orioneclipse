"use strict";
var lodash = require("lodash");

// var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.analyticsOn = null;
    this.portfolio = {
        total: null,
        existing: null,
        new: null
    };
    this.AUM = {
        total: null,
        changeValue: null,
        changePercent: null,
        status: null
    };
    this.issues = {
        total: null,
        errors: null,
        warnings: null
    };
    this.outOfTolerance = null;
    this.cashNeed = null;
    this.setForAutoRebalance = null;
    this.contribution = null;
    this.distribution = null;
    this.noModel = null;
    this.doNotTrade = null;
    this.TLHOpportunity = null;
    this.dataErrors = null;
    this.pendingTrades = null;

    return lodash.assignIn(this);
}