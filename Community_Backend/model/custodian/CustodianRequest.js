"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var CustodianData = require('model/custodian/Custodian.js');
var custodianData = new CustodianData();

var requestData = {
    tradeExecutionTypeId:null,
    tradeExecutions:{
        securityTypeId:null,
        tradeExecutionsTypeId:null
    }
}
custodianData = lodash.assignIn(baseModel, custodianData, requestData);


var CustodianRequest = function (data) {
    return this.data = this.sanitize(data);
}

CustodianRequest.prototype.sanitize = function (data) {
    if (data.tradeExecutions) {
        var tradeExecutions = lodash.map(data.tradeExecutions, function (tradeExecution) {
            return lodash.pick(lodash.defaultsDeep(tradeExecution, custodianData), lodash.keys(custodianData))
        });
        data.tradeExecution = tradeExecutions;
    }
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, custodianData), lodash.keys(custodianData));
}
module.exports = CustodianRequest;