"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseModel.js'))();
var baseOutputModel = new (require('model/base/BaseOutputModel.js'))();
var SecurityData = require('model/community/security/Security.js');
var securityData = new SecurityData();

var responseData = {
    symbol: null,
    securityType: null,
    category: null,
    assetClass: null,
    subClass: null,
    custodialCash: null 
}

var SecurityResponse = function (data) {
    securityData = lodash.assignIn(baseModel, securityData, responseData,baseOutputModel);
    if (Array.isArray(data)) {
        var SecurityList = lodash.map(data, function (strategist) {
            return lodash.pick(lodash.defaultsDeep(strategist, securityData), lodash.keys(securityData))
        });
        return SecurityList;
    } else {
        data = data || {};
        return lodash.pick(lodash.defaultsDeep(data, securityData), lodash.keys(securityData));
    }
}


module.exports = SecurityResponse;