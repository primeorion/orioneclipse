"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.name = null;
    this.value = null;
    this.type = null;

    return lodash.assignIn(this, new BaseOutputModel());
}