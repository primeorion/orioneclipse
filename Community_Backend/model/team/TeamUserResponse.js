"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

var TeamResponse = function () {
    var baseModel = lodash.omit(new BaseModel(),['name']);
    this.firstName = null;
    this.lastName = null;
    return lodash.assignIn(baseModel,this, new BaseOutputModel());
}


module.exports = TeamResponse;