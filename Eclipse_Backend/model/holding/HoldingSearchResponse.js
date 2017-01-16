"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.securityName = null;
    this.securitySymbol = null;
    this.accountName = null;
    this.accountNumber = null;
    this.portfolioName = null;
    this.price = null;
    this.shares = null;
    this.value = null;
    

    return lodash.assignIn(this, new BaseOutputModel());
}