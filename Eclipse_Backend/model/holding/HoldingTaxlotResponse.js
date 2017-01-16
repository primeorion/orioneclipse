"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.dateAcquired = null;
    this.quantity = null;
    this.costAmount = null;
    this.costPerShare = null;
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
