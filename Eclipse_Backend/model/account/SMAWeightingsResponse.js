"use strict";
var lodash = require("lodash");

var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.subModelId = null;
    this.subModelName = null;
    this.weightPercent = null;
    this.modelId = null;
    this.modelDetailId = null;


    return lodash.assignIn(this, new BaseOutputModel());
}