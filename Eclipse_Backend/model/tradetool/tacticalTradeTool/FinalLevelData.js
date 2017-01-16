"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
   this.portfolioInfo = {
        id: null,
        portfolioName: null,
        AUM: null,
        netCash: null,
        targetAmount: null,
        targetPer: null,
        currentAmount: null,
        currentPer: null,
        
    };
    this.model = [];
    return lodash.assignIn(this);
};
