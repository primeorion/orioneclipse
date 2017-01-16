

"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.accountName = null;
    this.currentValue = null;
    this.reserveValue = null;
    this.totalValue = null;
    this.targetValue = null;
    this.postTradeValue = null;
    this.needsValue = null;
   
    return lodash.assignIn(this);
};

