"use strict";

var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');
var CustodianData = require('model/custodian/Custodian.js');

var CustodianResponse = function () {
	this.accountNumber  = null;
    this.tradeExecutions = [];
    this.tradeExecutionTypeId = null;
    this.tradeExecutionTypeName = null;
    return lodash.assignIn(new BaseModel(), new CustodianData(), this, new BaseOutputModel());
}

module.exports = CustodianResponse;