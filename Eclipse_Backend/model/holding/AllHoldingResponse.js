"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
   // this.accountId = null;
  //  this.accountName = null;
    this.accountNumber = null;
    this.securityName = null;
  //  this.securitySymbol = null;
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

    return lodash.assignIn( this, new BaseOutputModel());
}