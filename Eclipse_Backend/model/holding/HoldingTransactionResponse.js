"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.date = null;
    this.type = null;
    this.amount = null;
    this.units = null;
    this.cost = null;
    this.price = null;
    return lodash.assignIn(this, new BaseOutputModel());
}
