"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var StrategistData = require('model/community/strategist/Strategist.js');
var strategistData = new StrategistData();

var requestData = {
    salesContact: null,
    salesPhone: null,
    legalAgreement: null,
    salesEmail: null,
    supportEmail: null,
    supportContact: null,
    supportPhone: null,
    strategyCommentary: null,
    advertisementMessage: null,
    assignedUserId: null,
    assignedUserName : null,
    assignedUserEmail:null,
    loginUserId : null,
    loginUserName : null,
    role: null,
    roleId : null,
    users:[],
    eclipseDatabaseId: null
}

var StrategistRequest = function (data) {
    strategistData = lodash.assignIn(baseModel, strategistData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, strategistData), lodash.keys(strategistData));
}

module.exports = StrategistRequest;