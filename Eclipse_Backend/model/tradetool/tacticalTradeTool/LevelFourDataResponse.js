"use strict";
var lodash = require("lodash");

module.exports = function () {
    this.id = null;
    this.levelName = null;
    this.targetAmount = null;
    this.targetPercentage = null;
    this.currentAmount = null;
    this.currentPercentage = null;
   
    return lodash.assignIn(this);
};
