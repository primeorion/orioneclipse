"use strict";

var lodash = require("lodash");
var BaseModel = require('model/base/BaseInputModel.js');
var CustodianData = require('model/custodian/Custodian.js');

var CustodianRequest = function () {
	this.masterAccountNumber = null;
    this.tradeExecutionTypeId = null;
    this.tradeExecutions = [];
    return lodash.assignIn(new BaseModel(), new CustodianData(), this);
}

module.exports = CustodianRequest;