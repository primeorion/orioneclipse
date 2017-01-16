"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.accountNumber = null;
    this.accountType = null;
    this.accountId = null;
    this.name = null;
    this.portfolio = null;
    this.custodian = null;
    this.value = null;
    this.managedValue = null;
    this.excludedValue = null;
    this.pendingValue = null;
    this.ssn = null;
    this.style = null;
    this.model = null;
    this.sleeveType = null;
    this.distributionAmount = null;
    this.contributionAmount = null;
    this.mergeIn = null;
    this.mergeOut = null;
    this.cashNeedAmount = null;
    this.cashTarget = null;
    this.targetCashReserve = null;
    this.systematicAmount = null;
    this.systematicDate = null;
    this.sma = null;
    this.status = null;
    this.reason = null;
    this.pendingTrades = null;
    this.eclipseCreatedDate = null;

    return lodash.assignIn(this, new BaseOutputModel());
}