"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var StrategistData = require('model/community/strategist/Strategist.js');
var strategistData = new StrategistData();

var requestData = {
    communityStrategistId: null,
}

var StrategistRequest = function (data) {

    strategistData = lodash.assignIn(baseModel, strategistData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, strategistData), lodash.keys(strategistData));
}

module.exports = StrategistRequest;