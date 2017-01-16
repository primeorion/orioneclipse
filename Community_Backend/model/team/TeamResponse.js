"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');
var TeamSchema = require('model/team/Team.js');

var TeamResponse = function () {
    this.numberOfUsers = null;
    this.numberOfModels = null;
    this.numberOfPortfolios = null;
    this.numberOfAdvisors = null;
    return lodash.assignIn(new BaseModel(), new TeamSchema(),this, new BaseOutputModel());
}


module.exports = TeamResponse;