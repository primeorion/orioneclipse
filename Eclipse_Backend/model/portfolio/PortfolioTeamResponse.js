"use strict";
var lodash = require("lodash");

module.exports = function () {
    this.id = null;
    this.name = null;
    this.isPrimary = null;
    this.portfolioAccess = null;
    
    return lodash.assignIn(this);
}