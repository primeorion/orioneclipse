"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseModel.js'))();
var baseOutputModel = new (require('model/base/BaseOutputModel.js'))();
var StrategistData = require('model/community/strategist/Strategist.js');
var strategistData = new StrategistData();

var responseData = {
    userCount: 0,
    users : [],
    statusLabel : ''
}

var StrategistResponseSimpleDetail = function (data) {
    strategistData = lodash.assignIn(strategistData, responseData, baseOutputModel);
    if (Array.isArray(data)) {
        var strategistUser = lodash.map(data, function (strategist) {
            return lodash.pick(lodash.defaultsDeep(strategist, strategistData), lodash.keys(strategistData))
        });
        return strategistUser;
    } else {
        data = data || {};
        return lodash.pick(lodash.defaultsDeep(data, strategistData), lodash.keys(strategistData));
    }
}

module.exports = StrategistResponseSimpleDetail;