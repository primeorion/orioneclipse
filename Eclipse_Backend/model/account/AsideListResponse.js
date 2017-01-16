"use strict";
var lodash = require("lodash");

var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null,
    this.description = null,
    this.cashAmountTypeId = null,
    this.cashAmountTypeName = null,
    this.cashAmount = null,
    this.expirationTypeId = null,
    this.expirationTypeName = null,
    this.expirationValue = null,
    this.toleranceValue = null,
    this.expiredOn = null,
    this.isExpired = null;
    //this.isReplenish = null;
    return lodash.assignIn(this, new BaseOutputModel());
}