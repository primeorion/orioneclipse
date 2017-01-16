"use strict";
var lodash = require("lodash");

module.exports = function () {
    this.id = null;
    this.levelName = null;
    this.targetAmount = null;
    this.targetPercentage = null;
    this.currentAmount = null;
    this.currentPercentage = null;
    this.level4 = [];
    return lodash.assignIn(this);
};
