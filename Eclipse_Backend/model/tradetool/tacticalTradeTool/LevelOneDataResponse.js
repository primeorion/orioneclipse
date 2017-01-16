"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.levelName = null;
    this.targetAmount = null;
    this.targetPercentage = null;
    this.currentAmount = null;
    this.currentPercentage = null;
    this.level2 = [];
    return lodash.assignIn(this);
};
