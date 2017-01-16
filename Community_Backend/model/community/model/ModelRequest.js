"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var ModelData = require('model/community/model/Model.js');
var modelData = new ModelData();

var requestData = {
    targetRiskLower: null,
    targetRiskUpper: null,
    currentRisk: null,
    minimumAmount: null,
    strategistId: null,
    tickersWithTargetInPercentage: null,
    lowerUpperToleranceInPercentage: null,
    requireCash: null,
    advisorFee: null,
    weightedAvgNetExpense: null,
    style: null
}
var ModelRequest = function (data) {
    modelData = lodash.assignIn(baseModel, modelData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, modelData), lodash.keys(modelData));
}

module.exports = ModelRequest;