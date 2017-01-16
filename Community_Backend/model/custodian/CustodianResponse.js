"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseModel.js'))();
var baseOutputModel = new (require('model/base/BaseOutputModel.js'))();
var CustodianData = require('model/custodian/Custodian.js');
var custodianData = new CustodianData();

var responseData = {
    tradeExecutions: { securityTypeId: null,securityTypeName: null, tradeExecutionTypeId: null,tradeExecutionTypeName:null },
    tradeExecutionTypeId: null,
    tradeExecutionTypeName: null,
}



var CustodianResponse = function (data) {
    responseData = lodash.assignIn(baseModel, custodianData, responseData,baseOutputModel);
    if (data.tradeExecutions) {
        responseData = lodash.omit(responseData, ['tradeExecutionTypeId']);
        responseData = lodash.omit(responseData, ['tradeExecutionTypeName']);
    } else {
        responseData = lodash.omit(responseData, ['tradeExecutions']);
    }
    return this.data = this.sanitize(data);
}

CustodianResponse.prototype.sanitize = function (data) {
    if (Array.isArray(data)) {
        var custodians = lodash.map(data, function (custodian) {
            responseData = lodash.omit(responseData,['tradeExecutions']);
            responseData = lodash.omit(responseData,['tradeExecutionTypeId']);
             responseData = lodash.omit(responseData, ['tradeExecutionTypeName']);
            return lodash.pick(lodash.defaultsDeep(custodian, responseData), lodash.keys(responseData))
        });
        return custodians;
    } else {
        data = data || {};
        if (data.tradeExecutions) {
            var tradeExecutions = lodash.map(data.tradeExecutions, function (trade) {
                return lodash.pick(lodash.defaultsDeep(trade, responseData.tradeExecutions), lodash.keys(responseData.tradeExecutions))
            });
            data["tradeExecutions"] = tradeExecutions;
        }
        return lodash.pick(lodash.defaultsDeep(data, responseData), lodash.keys(responseData));
    }
}
module.exports = CustodianResponse;