"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseModel.js'))();
var baseOutputModel = new (require('model/base/BaseOutputModel.js'))();
var StrategistData = require('model/community/strategist/Strategist.js');
var strategistData = new StrategistData();

var responseData = {
    salesContact: null,
    salesPhone: null,
    legalAgreement: null,
    salesEmail: null,
    supportEmail: null,
    supportContact: null,
    supportPhone: null,
    strategyCommentary: null,
    advertisementMessage: null,
    userCount: 0,
    modelCount: 0,
    statusLabel : '',
    eclipseDatabaseId: null,
    eclipseDatabaseName:null,
    users : [],
    models:[]
}

var StrategistResponse = function (data) {
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

module.exports = StrategistResponse;