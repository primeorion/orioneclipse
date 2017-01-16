"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

var TeamResponse = function () {
    this.source = null;
    return lodash.assignIn(new BaseModel(),this, new BaseOutputModel());
}


module.exports = TeamResponse;