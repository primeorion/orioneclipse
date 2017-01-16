

"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.acquiredDate = null;
    this.taxlotShares = null;
    this.taxlotPrice = null;
    this.costShortTerm = null;
    this.costLongTerm = null;
    this.gainAmount = null;
    this.gainPer = null;
    this.tradeGain = null;
    this.reedemptionFee = null;
    this.tradeCost= null;




    return lodash.assignIn(this);
};
