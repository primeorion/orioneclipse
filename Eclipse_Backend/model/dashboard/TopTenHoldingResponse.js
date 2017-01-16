"use strict";
var lodash = require("lodash");

module.exports = function () {
    this.securityName = null;
    this.marketValue = null;
    this.unit = null;
    this.price = null;
    this.percentage = null;

    return lodash.assignIn(this);
}