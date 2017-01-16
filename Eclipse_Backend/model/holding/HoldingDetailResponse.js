"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.securityName = null;
    this.securitySymbol = null;
  //  this.accountId = null;
    this.accountName = null;
    this.accountNumber = null;
    this.portfolioName = null;
 
    this.price = null;
    this.shares = null;
    this.value = null;
    this.currentInPer = null;
    this.targetInPer = null;
    this.pendingValue = null;
    this.pendingInPer = null;
    this.excluded = null;
    this.isCash = null;
    this.inModel = null;
    this.GLSection = {
        totalGainLoss: null,
        totalGainLossStatus: null,
        shortTermGL: null,
        shortTermGLStatus: null,
        longTermGL: null,
        longTermGLStatus: null

    };


    return lodash.assignIn(this, new BaseOutputModel());
}