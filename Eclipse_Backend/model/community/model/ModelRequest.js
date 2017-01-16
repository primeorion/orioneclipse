"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var ModelData = require('model/community/model/Model.js');
var modelData = new ModelData();

var requestData = {
    communityStrategistId: null,
    models: null
}
var ModelRequest = function (data) {
    modelData = lodash.assignIn(baseModel, modelData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, modelData), lodash.keys(modelData));
}

module.exports = ModelRequest;