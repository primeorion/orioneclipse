"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseModel.js'))();
var baseOutputModel = new (require('model/base/BaseOutputModel.js'))();
var ModelData = require('model/community/model/Model.js');
var modelData = new ModelData();

var responseData = {
    targetRiskLower: null,
    targetRiskUpper: null,
    currentRisk: null,
    minimumAmount: null,
    strategistId: null,
    style: null,
    tickersWithTargetInPercentage: null,
    lowerUpperToleranceInPercentage: null,
    allocation : null,
    advisorFee: null,
    securities : [],
    type : null,
    weightedAvgNetExpense: null,
    isDynamic : 0
}

var ModelResponse = function (data) {
    modelData = lodash.assignIn(baseModel, modelData, responseData, baseOutputModel);
    if (Array.isArray(data)) {
        var models = lodash.map(data, function (model) {
            return lodash.pick(lodash.defaultsDeep(model, modelData), lodash.keys(modelData))
        });
        return models;
    } else {
        data = data || {};
        return lodash.pick(lodash.defaultsDeep(data, modelData), lodash.keys(modelData));
    }
}

module.exports = ModelResponse;