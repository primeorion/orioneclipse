

"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.accountName = null;
    this.custodian = null;
    this.type = null;
    this.info = null;
    
    this.currentShares = null;
    this.currentAmount = null;
    
    this.costShortTerm = null;
    this.costLongTerm = null;
    this.gainAmount = null;
    this.gainPer = null;
    this.tradeGain = null;
    this.alternative = null;
    this.isSMA = null;
    return lodash.assignIn(this);
};





